/**
 * useLiveRoom — a thin reactive wrapper over a LiveKit Room that powers the
 * social live experience: subscribing to (or publishing) video, plus live chat,
 * floating reactions, and a live viewer count.
 *
 * Chat and reactions ride entirely on LiveKit's data channel (no server, no DB):
 * every participant token is minted with `canPublishData: true`, so messages are
 * peer-broadcast within the room and vanish when the stream ends. Sender names come
 * from the participant `name` baked into the token by the backend.
 */
import { ref, shallowRef, onBeforeUnmount } from 'vue'
import {
  Room,
  RoomEvent,
  Track,
  type LocalTrack,
  type RemoteTrack,
  type RemoteParticipant,
  type Participant,
} from 'livekit-client'

/** A remote publisher's video track, rendered as its own tile. */
export interface LiveVideoTile {
  id: string
  identity: string
  name: string
  track: RemoteTrack
}

export interface LiveChatMessage {
  id: string
  sender: string
  text: string
  self: boolean
  ts: number
}

export interface LiveFloatReaction {
  id: string
  emoji: string
}

type DataPayload =
  | { type: 'chat'; text: string; sender?: string }
  | { type: 'reaction'; emoji: string }

const uid = () =>
  (globalThis.crypto?.randomUUID?.() as string) ||
  `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function useLiveRoom() {
  const room = shallowRef<Room | null>(null)
  const connected = ref(false)
  const connecting = ref(false)
  const viewerCount = ref(0)
  const messages = ref<LiveChatMessage[]>([])
  const reactions = ref<LiveFloatReaction[]>([])
  const error = ref('')
  // Every remote publisher's video (broadcaster + any co-hosts), rendered as tiles.
  const remoteVideos = ref<LiveVideoTile[]>([])

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  // Remote audio elements LiveKit creates on attach; kept so we can mute them together.
  const audioEls = new Map<RemoteTrack, HTMLMediaElement>()
  const audioMuted = ref(false)

  function attachAudio(track: RemoteTrack) {
    if (track.kind !== Track.Kind.Audio || audioEls.has(track)) return
    const el = track.attach() // creates a media element that autoplays the room audio
    el.muted = audioMuted.value
    audioEls.set(track, el)
  }
  function detachAudio(track: RemoteTrack) {
    const el = audioEls.get(track)
    if (el) {
      try {
        track.detach(el)
      } catch {
        /* ignore */
      }
      audioEls.delete(track)
    }
  }
  function setAudioMuted(m: boolean) {
    audioMuted.value = m
    audioEls.forEach((el) => {
      el.muted = m
      if (!m) el.play?.().catch(() => {})
    })
  }
  // Whether we created the room (and must tear it down) or merely attached to a
  // room owned elsewhere (the broadcaster's publishing room).
  let owns = true

  function recount() {
    const r = room.value
    viewerCount.value = r ? r.numParticipants : 0
  }

  function addVideoTile(track: RemoteTrack, participant?: RemoteParticipant) {
    if (track.kind !== Track.Kind.Video) return
    const id = track.sid || `${participant?.identity}-${Date.now()}`
    if (remoteVideos.value.some((t) => t.id === id)) return
    remoteVideos.value = [
      ...remoteVideos.value,
      {
        id,
        identity: participant?.identity || '',
        name: participant?.name || participant?.identity || 'Guest',
        track,
      },
    ]
  }

  function removeVideoTile(track: RemoteTrack) {
    const sid = track.sid
    remoteVideos.value = remoteVideos.value.filter((t) => t.track !== track && t.id !== sid)
  }

  function removeParticipantTiles(participant: RemoteParticipant) {
    remoteVideos.value = remoteVideos.value.filter((t) => t.identity !== participant.identity)
  }

  function pushReaction(emoji: string) {
    const id = uid()
    reactions.value.push({ id, emoji })
    // Auto-expire so the floating animation can clean up.
    window.setTimeout(() => {
      reactions.value = reactions.value.filter((r) => r.id !== id)
    }, 2600)
  }

  function handleData(payload: Uint8Array, participant?: RemoteParticipant) {
    let msg: DataPayload
    try {
      msg = JSON.parse(decoder.decode(payload))
    } catch {
      return
    }
    if (msg.type === 'chat' && msg.text) {
      messages.value.push({
        id: uid(),
        sender: participant?.name || msg.sender || 'Guest',
        text: String(msg.text).slice(0, 500),
        self: false,
        ts: Date.now(),
      })
      // Cap in-memory history so a long stream can't grow unbounded.
      if (messages.value.length > 200) {
        messages.value.splice(0, messages.value.length - 200)
      }
    } else if (msg.type === 'reaction' && msg.emoji) {
      pushReaction(String(msg.emoji).slice(0, 8))
    }
  }

  /**
   * Connect to a LiveKit room. Pass `onVideoTrack` to receive the first remote
   * video track (viewer side). The publisher side attaches its own local tracks.
   */
  async function connect(
    url: string,
    token: string,
    opts: { onVideoTrack?: (track: RemoteTrack) => void } = {},
  ) {
    if (connecting.value || connected.value) return
    connecting.value = true
    error.value = ''
    const r = new Room({ adaptiveStream: true, dynacast: true })
    room.value = r

    r.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video) {
        opts.onVideoTrack?.(track)
        addVideoTile(track, participant)
      } else if (track.kind === Track.Kind.Audio) {
        attachAudio(track)
      }
    })
    r.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      removeVideoTile(track)
      detachAudio(track)
    })
    r.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) =>
      handleData(payload, participant),
    )
    r.on(RoomEvent.ParticipantConnected, recount)
    r.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      removeParticipantTiles(participant)
      recount()
    })
    r.on(RoomEvent.Disconnected, () => {
      connected.value = false
      remoteVideos.value = []
    })

    try {
      await r.connect(url, token)
      connected.value = true
      recount()
    } catch (e: unknown) {
      error.value = (e as Error)?.message || 'Could not connect to the live stream.'
      room.value = null
      throw e
    } finally {
      connecting.value = false
    }
  }

  /**
   * Attach chat/reactions/viewer-count to a room that is owned and connected
   * elsewhere (e.g. the broadcaster's publishing room). We wire the same data and
   * participant listeners but never disconnect it on our side.
   */
  function attach(existing: Room) {
    owns = false
    room.value = existing
    connected.value = true
    existing.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video) addVideoTile(track, participant)
    })
    existing.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => removeVideoTile(track))
    existing.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) =>
      handleData(payload, participant),
    )
    existing.on(RoomEvent.ParticipantConnected, recount)
    existing.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      removeParticipantTiles(participant)
      recount()
    })
    recount()
  }

  /** Publish local camera/mic tracks (co-host path) into the connected room. */
  async function publishTracks(tracks: LocalTrack[]) {
    const r = room.value
    if (!r || !connected.value) return
    for (const track of tracks) {
      try {
        await r.localParticipant.publishTrack(track)
      } catch {
        /* skip a track that fails to publish; keep the others */
      }
    }
  }

  async function publish(obj: DataPayload) {
    const r = room.value
    if (!r || !connected.value) return
    try {
      await r.localParticipant.publishData(encoder.encode(JSON.stringify(obj)), { reliable: true })
    } catch {
      /* best-effort; a dropped chat line shouldn't break the stream */
    }
  }

  async function sendChat(text: string) {
    const t = String(text || '').trim()
    if (!t) return
    const name = (room.value?.localParticipant as Participant | undefined)?.name || 'You'
    messages.value.push({ id: uid(), sender: name, text: t.slice(0, 500), self: true, ts: Date.now() })
    if (messages.value.length > 200) messages.value.splice(0, messages.value.length - 200)
    await publish({ type: 'chat', text: t.slice(0, 500), sender: name })
  }

  async function sendReaction(emoji: string) {
    pushReaction(emoji) // optimistic local render
    await publish({ type: 'reaction', emoji })
  }

  async function disconnect() {
    const r = room.value
    const ownedThis = owns
    room.value = null
    connected.value = false
    connecting.value = false
    viewerCount.value = 0
    messages.value = []
    reactions.value = []
    remoteVideos.value = []
    audioEls.forEach((el, track) => {
      try {
        track.detach(el)
      } catch {
        /* ignore */
      }
    })
    audioEls.clear()
    // Only tear down a room we created; an attached room is the caller's to close.
    if (r && ownedThis) {
      try {
        await r.disconnect()
      } catch {
        /* ignore */
      }
    }
  }

  onBeforeUnmount(disconnect)

  return {
    room,
    connected,
    connecting,
    viewerCount,
    messages,
    reactions,
    remoteVideos,
    audioMuted,
    error,
    connect,
    attach,
    disconnect,
    publishTracks,
    setAudioMuted,
    sendChat,
    sendReaction,
  }
}
