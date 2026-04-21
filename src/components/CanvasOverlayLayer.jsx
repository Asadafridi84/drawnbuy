import { useCanvasStore } from '../store/canvas';
import ProductCard from './ProductCard';
import EmojiSticker from './EmojiSticker';

export default function CanvasOverlayLayer({ canvasId }) {
  const cards    = useCanvasStore(s => s.cards[canvasId]) || [];
  const stickers = useCanvasStore(s => s.stickers[canvasId]) || [];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
        {cards.map(card => (
          <ProductCard key={card.id} card={card} canvasId={canvasId} />
        ))}
        {stickers.map(sticker => (
          <EmojiSticker key={sticker.id} sticker={sticker} canvasId={canvasId} />
        ))}
      </div>
    </div>
  );
}
