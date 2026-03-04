import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';
import { Socket } from 'socket.io-client';
import type { RoomState, UserRole } from '../App';

interface VideoPlayerProps {
    socket: Socket;
    roomState: RoomState;
    currentUserRole: UserRole;
}

// 2-second threshold for seeking to avoid jitter
const SYNC_THRESHOLD = 2;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ socket, roomState, currentUserRole }) => {
    const playerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const expectingStateChange = useRef(false);

    const hasPermission = currentUserRole === 'Host' || currentUserRole === 'Moderator';

    useEffect(() => {
        if (!isReady || !playerRef.current) return;

        // Sync state received from server
        const player = playerRef.current;

        const syncWithServer = async () => {
            try {
                const currentTime = await player.getCurrentTime();
                const state = await player.getPlayerState(); // 1 = playing, 2 = paused

                // Sync time if diff > threshold
                if (Math.abs(currentTime - roomState.currentTime) > SYNC_THRESHOLD) {
                    expectingStateChange.current = true;
                    player.seekTo(roomState.currentTime, true);
                }

                // Sync playback state
                if (roomState.playState === 'playing' && state !== 1) {
                    expectingStateChange.current = true;
                    player.playVideo();
                } else if (roomState.playState === 'paused' && state !== 2) {
                    expectingStateChange.current = true;
                    player.pauseVideo();
                }
            } catch (err) {
                console.error("Player error", err);
            }
        };

        syncWithServer();
    }, [roomState, isReady]);

    // Host/Mod interval to broadcast current time occasionally to keep late joiners in sync
    useEffect(() => {
        if (currentUserRole !== 'Host' && currentUserRole !== 'Moderator') return;
        if (!isReady || !playerRef.current) return;

        const interval = setInterval(async () => {
            if (roomState.playState === 'playing') {
                const time = await playerRef.current.getCurrentTime();
                socket.emit('sync_time', time);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUserRole, isReady, roomState.playState, socket]);

    const onReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        setIsReady(true);
        // Initial sync
        event.target.seekTo(roomState.currentTime);
        if (roomState.playState === 'playing') {
            event.target.playVideo();
        } else {
            event.target.pauseVideo();
        }
    };

    const onStateChange: YouTubeProps['onStateChange'] = async (event) => {
        // Prevent infinite loops if the state change was triggered by our own sync code
        if (expectingStateChange.current) {
            expectingStateChange.current = false;
            return;
        }

        if (!hasPermission) {
            // Revert the action
            expectingStateChange.current = true;
            if (roomState.playState === 'playing') {
                event.target.playVideo();
            } else {
                event.target.pauseVideo();
            }
            return;
        }

        const state = event.data;
        if (state === 1) { // Playing
            socket.emit('play');
        } else if (state === 2) { // Paused
            socket.emit('pause');
            const time = await event.target.getCurrentTime();
            socket.emit('seek', time);
        }
    };

    // Removed onPlaybackRateChange as it was unused

    // Removed onSeek as it was unused and its logic was handled by onStateChange for seeking on pause

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: roomState.playState === 'playing' ? 1 : 0,
            controls: 1, // Let YouTube handle controls, but we override them if permissions fail
            disablekb: hasPermission ? 0 : 1 // Disable keyboard controls for participants
        },
    };

    return (
        <div className="w-full h-full relative group">
            <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl shadow-inner border border-white/5"></div>
            <YouTube
                videoId={roomState.videoId}
                opts={opts}
                onReady={onReady}
                onStateChange={onStateChange}
                className="w-full h-[60vh] rounded-2xl overflow-hidden bg-gray-900 dark:bg-transparent"
                iframeClassName="w-full h-full"
            />

            {!hasPermission && (
                <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-gray-800 dark:text-gray-300 z-20 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent transition-colors">
                    Viewing Only - Host Controls Playback
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
