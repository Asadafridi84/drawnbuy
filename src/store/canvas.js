import { create } from 'zustand';

export const useCanvasStore = create((set) => ({
  // Product cards: { canvasId: [{ id, product, x, y, ownerId }] }
  cards: {},

  addCard: (canvasId, card) => set(state => ({
    cards: {
      ...state.cards,
      [canvasId]: [...(state.cards[canvasId] || []), card]
    }
  })),

  moveCard: (canvasId, cardId, x, y) => set(state => ({
    cards: {
      ...state.cards,
      [canvasId]: (state.cards[canvasId] || []).map(c =>
        c.id === cardId ? { ...c, x, y } : c
      )
    }
  })),

  removeCard: (canvasId, cardId, userId) => set(state => ({
    cards: {
      ...state.cards,
      [canvasId]: (state.cards[canvasId] || []).filter(c =>
        !(c.id === cardId && c.ownerId === userId)
      )
    }
  })),

  removeCardById: (canvasId, cardId) => set(state => ({
    cards: {
      ...state.cards,
      [canvasId]: (state.cards[canvasId] || []).filter(c => c.id !== cardId)
    }
  })),

  clearAllCards: (canvasId) => set(state => ({
    cards: { ...state.cards, [canvasId]: [] }
  })),

  // Emoji stickers: { canvasId: [{ id, emoji, x, y, ownerId }] }
  stickers: {},

  addSticker: (canvasId, sticker) => set(state => ({
    stickers: {
      ...state.stickers,
      [canvasId]: [...(state.stickers[canvasId] || []), sticker]
    }
  })),

  moveSticker: (canvasId, stickerId, x, y) => set(state => ({
    stickers: {
      ...state.stickers,
      [canvasId]: (state.stickers[canvasId] || []).map(s =>
        s.id === stickerId ? { ...s, x, y } : s
      )
    }
  })),

  removeSticker: (canvasId, stickerId, userId) => set(state => ({
    stickers: {
      ...state.stickers,
      [canvasId]: (state.stickers[canvasId] || []).filter(s =>
        !(s.id === stickerId && s.ownerId === userId)
      )
    }
  })),

  removeStickerById: (canvasId, stickerId) => set(state => ({
    stickers: {
      ...state.stickers,
      [canvasId]: (state.stickers[canvasId] || []).filter(s => s.id !== stickerId)
    }
  })),

  clearAllStickers: (canvasId) => set(state => ({
    stickers: { ...state.stickers, [canvasId]: [] }
  })),

  // Recording state: { canvasId: { userId, userName } | null }
  recording: {},

  setRecording: (canvasId, userInfo) => set(state => ({
    recording: { ...state.recording, [canvasId]: userInfo }
  })),

  clearRecording: (canvasId) => set(state => ({
    recording: { ...state.recording, [canvasId]: null }
  })),
}));
