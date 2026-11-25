/**
 * The learning path. `lessons` lists lesson slugs in the order learners take them.
 * Levels 2–5 are announced but not published in the MVP.
 */
export const levels = [
  {
    id: 0,
    slug: "level-0",
    title: "Chuẩn bị",
    description:
      "Làm quen với cây đàn: cấu tạo, tư thế, lên dây, đọc sơ đồ hợp âm và tab, cách cầm pick. Khoảng 1 tuần.",
    lessons: [
      "cau-tao-dan",
      "tu-the-cam-dan",
      "len-day-dan",
      "doc-so-do-hop-am",
      "doc-tab",
      "cam-pick-va-gay",
    ],
    levelTest: [
      {
        id: "goi-ten-bo-phan",
        description: "Gọi đúng tên đầu đàn, cần đàn, phím đàn, thùng đàn, ngựa đàn",
      },
      {
        id: "len-day-6-day",
        description: "Tự lên đủ 6 dây bằng máy lên dây",
        target: "dưới 3 phút",
      },
      { id: "doc-so-do", description: "Đọc một sơ đồ hợp âm bất kỳ và đặt ngón đúng vị trí" },
      {
        id: "doc-tab",
        description: "Chơi được một đoạn tab 1 dây chậm rãi theo metronome",
        target: "60 BPM",
      },
    ],
  },
  {
    id: 1,
    slug: "level-1",
    title: "Nền tảng",
    description:
      "8 hợp âm mở, các điệu quạt chả cơ bản và chuyển hợp âm mượt — đủ để đệm những bài ballad đầu tiên. Khoảng 3 tháng.",
    lessons: [
      "hop-am-em",
      "hop-am-am",
      "quat-cha-co-ban-1",
      "hop-am-e",
      "hop-am-a",
      "hop-am-d",
      "hop-am-dm",
      "hop-am-g",
      "hop-am-c",
      "quat-cha-co-ban-2",
      "quat-cha-co-ban-3",
      "bai-hat-chung-ta-khong-thuoc-ve-nhau",
      "bai-hat-noi-nay-co-anh",
      "bai-hat-di-de-tro-ve",
      "bai-hat-phia-sau-mot-co-gai",
      "chuyen-hop-am-mot-phut",
      "bai-hat-em-cua-ngay-hom-qua",
      "kiem-tra-cap-1",
    ],
    levelTest: [
      {
        id: "tam-hop-am-sach",
        description: "Bấm 8 hợp âm Em, Am, E, A, D, Dm, G, C sạch, không rè dây",
      },
      { id: "chuyen-g-c", description: "Chuyển G → C", target: "ít nhất 30 lần/phút" },
      { id: "chuyen-am-dm", description: "Chuyển Am → Dm và D → A", target: "ít nhất 30 lần/phút" },
      {
        id: "quat-d-du-udu",
        description: "Giữ điệu quạt D-DU-UDU đều tay theo metronome",
        target: "80 BPM",
      },
      { id: "dem-tron-bai", description: "Đệm trọn một bài hát không dừng", target: "80 BPM" },
    ],
  },
  {
    id: 2,
    slug: "level-2",
    title: "Cơ bản vững",
    description: "Hợp âm chặn, rải dây, nhịp móc kép, gam Pentatonic, đọc nốt nhạc.",
    lessons: [],
    levelTest: [{ id: "sap-ra-mat", description: "Sắp ra mắt" }],
    comingSoon: true,
  },
  {
    id: 3,
    slug: "level-3",
    title: "Trung cấp",
    description: "Bản đồ cần đàn (CAGED), hợp âm ba nốt, nhạc lý hợp âm, luyện tai.",
    lessons: [],
    levelTest: [{ id: "sap-ra-mat", description: "Sắp ra mắt" }],
    comingSoon: true,
  },
];
