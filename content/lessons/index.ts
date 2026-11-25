/**
 * Registry of lesson MDX files. Add new lessons here AND to content/levels.ts.
 * `file` is the path relative to content/lessons (used by the content checker).
 */
import * as caoTaoDan from "./level-0/cau-tao-dan.mdx";
import * as tuTheCamDan from "./level-0/tu-the-cam-dan.mdx";
import * as lenDayDan from "./level-0/len-day-dan.mdx";
import * as docSoDoHopAm from "./level-0/doc-so-do-hop-am.mdx";
import * as docTab from "./level-0/doc-tab.mdx";
import * as camPickVaGay from "./level-0/cam-pick-va-gay.mdx";
import * as hopAmEm from "./level-1/hop-am-em.mdx";
import * as hopAmAm from "./level-1/hop-am-am.mdx";
import * as quatCha1 from "./level-1/quat-cha-co-ban-1.mdx";
import * as hopAmE from "./level-1/hop-am-e.mdx";
import * as hopAmA from "./level-1/hop-am-a.mdx";
import * as hopAmD from "./level-1/hop-am-d.mdx";
import * as hopAmDm from "./level-1/hop-am-dm.mdx";
import * as hopAmG from "./level-1/hop-am-g.mdx";
import * as hopAmC from "./level-1/hop-am-c.mdx";
import * as quatCha2 from "./level-1/quat-cha-co-ban-2.mdx";
import * as quatCha3 from "./level-1/quat-cha-co-ban-3.mdx";
import * as chuyenHopAm from "./level-1/chuyen-hop-am-mot-phut.mdx";
import * as baiHatChungTa from "./level-1/bai-hat-chung-ta-khong-thuoc-ve-nhau.mdx";
import * as baiHatNoiNay from "./level-1/bai-hat-noi-nay-co-anh.mdx";
import * as baiHatDiDe from "./level-1/bai-hat-di-de-tro-ve.mdx";
import * as baiHatPhiaSau from "./level-1/bai-hat-phia-sau-mot-co-gai.mdx";
import * as baiHatEmCua from "./level-1/bai-hat-em-cua-ngay-hom-qua.mdx";
import * as kiemTraCap1 from "./level-1/kiem-tra-cap-1.mdx";

type LessonModule = typeof caoTaoDan;

export const lessonModules: { file: string; module: LessonModule }[] = [
  { file: "level-0/cau-tao-dan.mdx", module: caoTaoDan },
  { file: "level-0/tu-the-cam-dan.mdx", module: tuTheCamDan },
  { file: "level-0/len-day-dan.mdx", module: lenDayDan },
  { file: "level-0/doc-so-do-hop-am.mdx", module: docSoDoHopAm },
  { file: "level-0/doc-tab.mdx", module: docTab },
  { file: "level-0/cam-pick-va-gay.mdx", module: camPickVaGay },
  { file: "level-1/hop-am-em.mdx", module: hopAmEm },
  { file: "level-1/hop-am-am.mdx", module: hopAmAm },
  { file: "level-1/quat-cha-co-ban-1.mdx", module: quatCha1 },
  { file: "level-1/hop-am-e.mdx", module: hopAmE },
  { file: "level-1/hop-am-a.mdx", module: hopAmA },
  { file: "level-1/hop-am-d.mdx", module: hopAmD },
  { file: "level-1/hop-am-dm.mdx", module: hopAmDm },
  { file: "level-1/hop-am-g.mdx", module: hopAmG },
  { file: "level-1/hop-am-c.mdx", module: hopAmC },
  { file: "level-1/quat-cha-co-ban-2.mdx", module: quatCha2 },
  { file: "level-1/quat-cha-co-ban-3.mdx", module: quatCha3 },
  { file: "level-1/chuyen-hop-am-mot-phut.mdx", module: chuyenHopAm },
  { file: "level-1/bai-hat-chung-ta-khong-thuoc-ve-nhau.mdx", module: baiHatChungTa },
  { file: "level-1/bai-hat-noi-nay-co-anh.mdx", module: baiHatNoiNay },
  { file: "level-1/bai-hat-di-de-tro-ve.mdx", module: baiHatDiDe },
  { file: "level-1/bai-hat-phia-sau-mot-co-gai.mdx", module: baiHatPhiaSau },
  { file: "level-1/bai-hat-em-cua-ngay-hom-qua.mdx", module: baiHatEmCua },
  { file: "level-1/kiem-tra-cap-1.mdx", module: kiemTraCap1 },
];
