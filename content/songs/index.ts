/**
 * Songs used in level-1 lessons. One file per song, registered here.
 *
 * Rules (FR-005, Constitution II): title, artist, composer, chords per section, strum pattern,
 * tempo, capo and a link to the official recording ONLY — never lyrics, recordings or copied tabs.
 * Level-1 songs must use only Em, Am, E, A, D, Dm, G, C (simplified arrangements, capo allowed).
 * `bpm` is a suggested practice tempo, not necessarily the original tempo.
 */
import { song as chungTaKhongThuocVeNhau } from "./chung-ta-khong-thuoc-ve-nhau";
import { song as diDeTroVe } from "./di-de-tro-ve";
import { song as emCuaNgayHomQua } from "./em-cua-ngay-hom-qua";
import { song as noiNayCoAnh } from "./noi-nay-co-anh";
import { song as phiaSauMotCoGai } from "./phia-sau-mot-co-gai";

export const songs: unknown[] = [
  chungTaKhongThuocVeNhau,
  noiNayCoAnh,
  diDeTroVe,
  phiaSauMotCoGai,
  emCuaNgayHomQua,
];
