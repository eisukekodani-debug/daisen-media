// サイト内リンク。公開先のパス（base）が変わっても壊れないようにする
export const u = (path: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};
