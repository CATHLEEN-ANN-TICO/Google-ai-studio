
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '../types';
import { ShareIcon, CopyIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    onClick 
}: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [isCodeCopied, setIsCodeCopied] = useState(false);

    // Auto-scroll logic for this specific card
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [artifact.html]);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!artifact.html) return;

        try {
            const base64 = btoa(unescape(encodeURIComponent(artifact.html)));
            const shareUrl = `${window.location.origin}${window.location.pathname}#share=${base64}`;

            if (navigator.share) {
                await navigator.share({
                    title: 'Check out this UI on Flash UI',
                    text: `I generated this "${artifact.styleName}" component with Flash UI.`,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setIsShareCopied(true);
                setTimeout(() => setIsShareCopied(false), 2000);
            }
        } catch (err) {
            console.error('Failed to share:', err);
        }
    };

    const handleCopyHTML = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!artifact.html) return;

        try {
            await navigator.clipboard.writeText(artifact.html);
            setIsCodeCopied(true);
            setTimeout(() => setIsCodeCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy HTML:', err);
        }
    };

    const isBlurring = artifact.status === 'streaming';

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${isBlurring ? 'generating' : ''}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                <span className="artifact-style-tag">{artifact.styleName}</span>
                {artifact.status === 'complete' && (
                    <div className="artifact-header-actions">
                        <button 
                            className={`share-button copy-html-btn ${isCodeCopied ? 'copied' : ''}`} 
                            onClick={handleCopyHTML}
                            title="Copy HTML to clipboard"
                        >
                            {isCodeCopied ? 'HTML Copied!' : <><CopyIcon /> Copy HTML</>}
                        </button>
                        <button 
                            className={`share-button ${isShareCopied ? 'copied' : ''}`} 
                            onClick={handleShare}
                            title="Share this component link"
                        >
                            {isShareCopied ? 'Link Copied!' : <><ShareIcon /> Share</>}
                        </button>
                    </div>
                )}
            </div>
            <div className="artifact-card-inner">
                {isBlurring && (
                    <div className="generating-overlay">
                        <pre ref={codeRef} className="code-stream-preview">
                            {artifact.html}
                        </pre>
                    </div>
                )}
                <iframe 
                    srcDoc={artifact.html} 
                    title={artifact.id} 
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                    className="artifact-iframe"
                />
            </div>
        </div>
    );
});

export default ArtifactCard;
