# -*- coding: utf-8 -*-
import os
content = "import { useCanvasStore } from '../store/canvas';\nimport ProductCard from './ProductCard';\nimport EmojiSticker from './EmojiSticker';\n\nexport default function CanvasOverlayLayer({ canvasId }) {\n  const cards    = useCanvasStore(s => s.cards[canvasId]) || [];\n  const stickers = useCanvasStore(s => s.stickers[canvasId]) || [];\n\n  return (\n    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>\n      <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>\n        {cards.map(card => (\n          <ProductCard key={card.id} card={card} canvasId={canvasId} />\n        ))}\n        {stickers.map(sticker => (\n          <EmojiSticker key={sticker.id} sticker={sticker} canvasId={canvasId} />\n        ))}\n      </div>\n    </div>\n  );\n}\n"
open(r"src\components\CanvasOverlayLayer.jsx", "w", encoding="utf-8").write(content)
print("Done!")
