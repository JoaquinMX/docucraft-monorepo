import type { Diagram } from "@/types/Diagram";
import type { Project } from "@/types/Project";

export const projects: Project[] = [
  {
    id: "1",
    name: "Project Alpha",
    description: "Description 1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRfMiK-Xsf_XJBQ3H4OOzgt7XeJ2nlf0u5HP2OMdgTEFA6OqignBoIALpu7JH9qaD1CPWYihZ0v-LxhByazArNbkFSjDX64RrLUNm5bR87uvW4-mwwkEkWQJsYy1NgRURSibn5ZrYE2-dDsbn-opjBbXi52q6b--SQUoaDvlRLtnkcrQxFNFrVXaDSFXGwOrl88zQ9madUbeeV5oStfpycOFShMuBaw93px9MaeHTBscgMuEuKVyYGrECq4nbvAqkegfbiphNC3Q",
  },
  {
    id: "2",
    name: "Project Beta",
    description: "Description 2",
    createdAt: "2024-02-01",
    updatedAt: "2024-02-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4sxboJMHRvf9OtyckB-ZNhIQQ7PTVSJlK6bjLjsqQaBA6xCb23ONpzhOtuA1gOQQM2uMloMpFi3m-AoKDOHJ3UchFLj9fySIcP3WaPKvRcWktE7pZ8u24ORul2r9z70qB5hMwkRSOmUR8_Hi6Nm5Gc5n3E8dBPzzhtGo5glJRA9q7lDmtEcrPoKnW8CZtDtuJp_wc3e5yfwWNw0gALE4JgZBQVFXIeDsvCCJuocISrOaZKZi7aKKTGtnygGx_biLKbHo-OqeuUg",
  },
  {
    id: "3",
    name: "Project Gamma",
    description: "Description 3",
    createdAt: "2024-03-01",
    updatedAt: "2024-03-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBp3fqlJYiT7tg0jIUJHNsTvAhzrMA93G7bHlh9d1ptiZCLBvmslWu6veBcZ0NfHzj30NDxslEzmfkWba1tkS__FntK0-KF-oeMAtUMSSOwYvIyOs2xb5D6KYcYHxG-mvQnkzjZGbMVf-pbljKiJZOuX5_jyaWH46E0KAastCnXvzywcgkT3g8gBOUaKeUgg3mEASLW56BCjbWZfak43yAxm6JsHVKpxmfrSF94KayOVTncTK7NcjCSmejwjdW0rPi4a8AnLdvQXA",
  },
  {
    id: "4",
    name: "Project Delta",
    description: "Description 4",
    createdAt: "2024-04-01",
    updatedAt: "2024-04-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYPgoccUo1YuAT-nnbvQoGQ1_IsQ64LxpW-uMJhSYnL4DlGuJK2ODMN-SWtQVm7ys-db8pCZNLYZ4bwqjsMqefgY37uAxMM9bbofCmOEU2zwjpO79ZhEK8MALzsepTYVOTx9ZpI5djWzxMQc_KR4e3jAFs46dt9aOaAHurhP60EZ7KtgVjro4nzHJbYGHJcUPgG_wfpADSmMwPzIujMqFYdaiXMavGQs_UTERgc-_GrxfvPcVEIcPm_YK6bvBty0x-Fz3Y5wZhZA",
  },
  {
    id: "5",
    name: "Project Epsilon",
    description: "Description 5",
    createdAt: "2024-05-01",
    updatedAt: "2024-05-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4-kTLUBVaRiW5t1gR3Bjaz9Sk3XzltZGiToolwC3-gXLwME-jmd7nW-NrKi62sN6iQmYZDiO0f2oyHtLwRIgL3A0DEltVhbzK7UmIUJkhk3qP88ZrPm4cHvl7_tapNUU9KQ858RgAtyzHyTKeTxW0MmqNgnd-7yMQuO8tuPQ07HX_la13ohsN9Kwk3DTKdSBC9JizHK1MorJk89v1aF50kNy9rZi79ozU6zNr6-_ziPkFxHugseDwg7HyFsYKQoABp46ARy8Ybg",
  },
  {
    id: "6",
    name: "Project Zeta",
    description: "Description 6",
    createdAt: "2024-06-01",
    updatedAt: "2024-06-15",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNnEgjfBDxmFj34mkGct7gTIUr6nkK-IdiTe-gO2zzMzd2bU0FBmF5tjISGCzj4sECgBCI-Q5FlL4Qy3b3G_5jkK2er1a0ZfKT1TI-ONQ5ZD2WKXlKZUFOfxSm5SZicHajxOp8jo2JfpuBs2p1kKFO-VnwJhjpn_PrREgbdXxzj61XFUOmaF9sDYsZgY_-TlFIzUEmLB_2dF_ZvfKIhCP3VYOLM235T5yB6zyRPyOLoaGxga17Tpb2YyzrozCXlatJ5ryfXaRcEQ",
  },
];

export const diagrams: Diagram[] = [
  {
    id: "erd",
    name: "ERD",
    description: "Entity Relationship Diagram",
    path: "M152,96V80h-8a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h8V160a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16v48a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V192h-8a32,32,0,0,1-32-32V136H80v8a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V112A16,16,0,0,1,32,96H64a16,16,0,0,1,16,16v8h32V96a32,32,0,0,1,32-32h8V48a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V96a16,16,0,0,1-16,16H168A16,16,0,0,1,152,96Z",
    icon: "TreeStructure",
  },
  {
    id: "architecture",
    name: "Architecture",
    description: "Architecture Diagram",
    path: "M168,112h48a16,16,0,0,0,16-16V48a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16V64h-8a32,32,0,0,0-32,32v24H80v-8A16,16,0,0,0,64,96H32a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16v-8h32v24a32,32,0,0,0,32,32h8v16a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V160a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16v16h-8a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16h8V96A16,16,0,0,0,168,112ZM64,144H32V112H64v32Zm104,16h48v48H168Zm0-112h48V96H168Z",
    icon: "TreeStructure",
  },
  {
    id: "c4",
    name: "C4 Diagram",
    description: "Contextual C4 Diagram",
    path: "M168,112h48a16,16,0,0,0,16-16V48a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16V64h-8a32,32,0,0,0-32,32v24H80v-8A16,16,0,0,0,64,96H32a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16v-8h32v24a32,32,0,0,0,32,32h8v16a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V160a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16v16h-8a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16h8V96A16,16,0,0,0,168,112ZM64,144H32V112H64v32Zm104,16h48v48H168Zm0-112h48V96H168Z",
    icon: "TreeStructure",
  },
  {
    id: "user-stories",
    name: "User Stories",
    description: "User Stories",
    path: "M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Zm32,16H96a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H152V160a8,8,0,0,1,8-8h48V48H48Zm120-40v28.7L196.69,168Z",
    icon: "Note",
  },
  {
    id: "gantt",
    name: "Gantt Chart",
    description: "Gantt Chart",
    path: "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z",
    icon: "Calendar",
  },
  {
    id: "kanban",
    name: "Kanban",
    description: "Kanban",
    path: "M216,48H40a8,8,0,0,0-8,8V208a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V160h48v16a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V56A8,8,0,0,0,216,48ZM88,208H48V128H88Zm0-96H48V64H88Zm64,32H104V64h48Zm56,32H168V128h40Zm0-64H168V64h40Z",
    icon: "Kanban",
  },
];
