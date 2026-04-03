---
description: Agentic Workflow for Autonomous Coding and Testing (Keepsake v5.0)
---

# 🤖 Agentic Repair Workflow v7.1 — React Web App

## 1. Config

```yaml
TEST_USER: test@example.com
TEST_PASS: 123456789
BREAKPOINTS:
  mobile: < 768px
  tablet: 768px – 1279px
  desktop: ≥ 1280px
MAX_LOOP: 5
LOW_SEV_PASS_THRESHOLD: 3
```

---

## 2. Roles

### 🧠 CODER

Nhận `USER_REQUEST` + `issues[]` từ TESTER của vòng trước.

**Nhiệm vụ:**
- Chỉ sửa đúng các issue được report, không redesign
- Giữ nguyên các feature đang hoạt động
- Output format bắt buộc:

```json
{
  "version": "v1.x",
  "changed_files": ["ComponentA.tsx", "styles.css"],
  "code": "...",
  "notes": "mô tả ngắn gọn đã sửa gì"
}
```

---

### 🔍 TESTER — Kiểm tra toàn diện

> Chạy toàn bộ checklist theo thứ tự. Không được bỏ qua bất kỳ mục nào.
> Mỗi mục fail → ghi vào `issues[]` với đầy đủ fields.

---

#### PHASE 0 — Setup & Login

- [ ] Truy cập app trên Chrome (desktop ≥1280px) — kiểm tra load thành công, không lỗi console
- [ ] Login với `TEST_USER` / `TEST_PASS`
- [ ] Kiểm tra redirect sau login đúng trang
- [ ] Kiểm tra session token lưu đúng (localStorage / cookie)
- [ ] Reload lại trang → vẫn giữ session, không bị logout

---

#### PHASE 1 — Notebook / Lined Paper

> Đây là component quan trọng nhất — kiểm tra kỹ nhất.

**1.1 Line alignment**
- [ ] Mỗi dòng text phải nằm đúng trên đường kẻ ngang, tolerance ±1px
- [ ] `line-height` của text phải bằng đúng khoảng cách giữa 2 đường kẻ (pixel-perfect)
- [ ] Kiểm tra bằng DevTools: inspect `line-height` CSS vs height của `.line` element
- [ ] Không có dòng text bị lệch giữa các đoạn (paragraph break không phá vỡ alignment)
- [ ] Với font khác nhau (nếu có), line-height vẫn khớp đường kẻ

**1.2 Font rendering**
- [ ] Font được load đúng (không fallback sang system font)
- [ ] Font-size nhất quán trên toàn bộ notebook (không có chỗ to hơn/nhỏ hơn)
- [ ] Không có text bị blurry hoặc subpixel rendering sai trên màn hình Retina/HiDPI
- [ ] Kiểm tra `font-smoothing`: `-webkit-font-smoothing: antialiased` được áp dụng
- [ ] Letter-spacing và word-spacing đồng đều, không có chỗ bị dồn/thưa

**1.3 Nhập liệu dài**
- [ ] Tạo entry 1500 ký tự — text wrap đúng, không tràn ra ngoài container
- [ ] Scroll dọc mượt khi nội dung dài hơn viewport
- [ ] Đường kẻ tiếp tục chạy đúng sau khi scroll (không bị offset)
- [ ] Ký tự đặc biệt (tiếng Việt có dấu, emoji) không làm vỡ line-height
- [ ] Date format hiển thị đúng `dd/mm/yyyy` ở mọi nơi trong notebook

**1.4 Page flip**
- [ ] Chuyển trang (page flip) không reset scroll position đột ngột
- [ ] Content của trang mới load đúng, không bị trống
- [ ] Animation page flip (nếu có) chạy mượt, không jank
- [ ] Sau khi flip: line alignment vẫn đúng ±1px
- [ ] Nút prev/next page hoạt động đúng, không cho phép vượt quá trang đầu/cuối

---

#### PHASE 2 — Modal / Dialog

**2.1 Mở modal**
- [ ] Modal mở đúng khi trigger (click button / phím tắt)
- [ ] Animation mở: duration hợp lý (150–300ms), easing tự nhiên (ease-out)
- [ ] Không có layout shift trên background khi modal mở (scrollbar width compensation)
- [ ] Backdrop/overlay hiển thị đúng màu và opacity

**2.2 Z-index & layer stacking**
- [ ] Modal luôn nằm trên tất cả các element khác (không bị che bởi sidebar, header, dropdown)
- [ ] Backdrop nằm dưới modal nhưng trên toàn bộ content
- [ ] Nếu có nested modal: z-index tăng dần đúng thứ tự
- [ ] Toast/notification không bị modal che (nếu toast z-index > modal)
- [ ] Kiểm tra DevTools: `z-index` stack không có conflict

**2.3 Focus trap**
- [ ] Khi modal mở: focus tự động chuyển vào modal (vào button đầu tiên hoặc input đầu tiên)
- [ ] Tab/Shift+Tab chỉ di chuyển trong modal, không thoát ra ngoài
- [ ] Escape key đóng modal
- [ ] Sau khi đóng modal: focus trả về element đã trigger modal

**2.4 Đóng modal**
- [ ] Click backdrop đóng modal (nếu được thiết kế vậy)
- [ ] Animation đóng mượt, không nhảy cóc
- [ ] Không để lại `overflow: hidden` trên `<body>` sau khi đóng (body scroll phải hoạt động lại)
- [ ] Kiểm tra close với cả: nút X, Escape, click backdrop — ba cách đều hoạt động

**2.5 Modal trên mobile**
- [ ] Modal không bị keyboard ảo che mất nội dung quan trọng
- [ ] Nội dung bên trong modal scroll được nếu dài hơn viewport
- [ ] Touch vào backdrop (ngoài modal) đóng được modal

---

#### PHASE 3 — Table / Data Grid

**3.1 Layout & alignment**
- [ ] Header cột thẳng hàng với data bên dưới (pixel-perfect alignment)
- [ ] Text trong cell không tràn ra ngoài, có truncate hoặc wrap đúng
- [ ] Số liệu (số, ngày) align-right; text align-left — nhất quán toàn bộ table
- [ ] Border/separator giữa các row/column rõ ràng, không bị double border
- [ ] Date hiển thị đúng format `dd/mm/yyyy`

**3.2 Scroll behavior**
- [ ] Nếu table có nhiều row: scroll dọc mượt, không jank
- [ ] Sticky header hoạt động đúng khi scroll (nếu có)
- [ ] Nếu table có nhiều cột: scroll ngang hoạt động, không bị layout vỡ
- [ ] Infinite scroll (nếu có): load thêm dữ liệu khi scroll đến cuối, không duplicate row
- [ ] Paginated (nếu có): chuyển trang đúng, giữ scroll position ở top

**3.3 Interaction**
- [ ] Sort cột: click header sort ascending/descending, icon sort hiển thị đúng
- [ ] Row hover state hiển thị rõ ràng
- [ ] Nếu có row selection: checkbox align đúng với row, không bị lệch
- [ ] Kiểm tra với 0 row (empty state), 1 row, và 100+ row

**3.4 Responsive**
- [ ] Mobile: table không bị tràn viewport (có horizontal scroll hoặc layout thay đổi)
- [ ] Tablet: cột hiển thị hợp lý, không quá chật
- [ ] Desktop: table tận dụng full width, không có khoảng trắng thừa

---

#### PHASE 4 — Scroll Behavior

**4.1 Scroll toàn trang**
- [ ] Scroll dọc mượt trên desktop (60fps, không drop frame)
- [ ] Scroll dọc mượt trên mobile (touch scroll, momentum scrolling hoạt động)
- [ ] Không có "scroll chaining" không mong muốn (modal scroll không trigger body scroll)
- [ ] `overscroll-behavior` được set đúng trên các scroll container

**4.2 Infinite scroll (nếu có)**
- [ ] Trigger load đúng vị trí (cách bottom ~200px)
- [ ] Loading indicator hiển thị khi đang fetch
- [ ] Không load duplicate item
- [ ] Khi hết data: hiển thị "Không còn dữ liệu" thay vì loop hoặc lỗi

**4.3 Paginated scroll**
- [ ] Chuyển trang: scroll về top tự động
- [ ] Số trang hiển thị đúng
- [ ] Nút prev/next disable đúng ở trang đầu/cuối

---

#### PHASE 5 — Animation & Performance

**5.1 Animation timing**
- [ ] Tất cả transition duration: 150–400ms (không quá nhanh, không quá chậm)
- [ ] Easing function tự nhiên: `ease-out` cho element xuất hiện, `ease-in` cho biến mất
- [ ] Không có animation dùng `width`, `height`, `top`, `left` (gây layout recalc) — phải dùng `transform`
- [ ] Không có animation bị "jank" (drop dưới 60fps) — kiểm tra Chrome DevTools > Performance

**5.2 FPS check**
- [ ] Mở modal: FPS không drop dưới 55fps
- [ ] Page flip: FPS không drop dưới 55fps
- [ ] Scroll 1500-char notebook: FPS không drop dưới 55fps
- [ ] Kiểm tra với CPU throttle 4x (DevTools) — app vẫn dùng được, animation không bị skip

**5.3 Reduced motion**
- [ ] Nếu `prefers-reduced-motion: reduce` → tất cả animation tắt hoặc instant
- [ ] Kiểm tra: DevTools > Rendering > Emulate CSS media > prefers-reduced-motion

---

#### PHASE 6 — Keyboard Navigation

**6.1 Tab order**
- [ ] Tab qua toàn bộ interactive element theo thứ tự logic (trái → phải, trên → dưới)
- [ ] Không có element bị skip hoặc bị trap ngoài modal
- [ ] `tabindex` không dùng giá trị > 0 (chỉ dùng 0 và -1)

**6.2 Focus visible**
- [ ] Focus indicator hiển thị rõ trên mọi element (không bị ẩn bởi `outline: none` không có replacement)
- [ ] Focus ring đủ contrast (WCAG AA: 3:1 ratio với background)
- [ ] Kiểm tra: dùng keyboard hoàn toàn, không cần chuột

**6.3 Phím tắt**
- [ ] Escape: đóng modal, đóng dropdown
- [ ] Enter/Space: activate button, checkbox
- [ ] Arrow keys: navigate trong dropdown, table row (nếu có)

---

#### PHASE 7 — Touch Gesture (Mobile)

- [ ] Tap: response time < 100ms, không có 300ms delay
- [ ] Swipe dọc: scroll mượt, không bị intercept sai
- [ ] Swipe ngang (page flip nếu có): gesture detect đúng, không nhầm với scroll dọc
- [ ] Pinch-to-zoom: không bị disable trên toàn trang (chỉ disable trong component cần thiết)
- [ ] Long press: không trigger context menu không mong muốn trên text
- [ ] Tap target size: mọi button/link tối thiểu 44×44px (Apple HIG standard)

---

#### PHASE 8 — Responsive (3 Breakpoints)

Chạy lại các check sau trên **từng breakpoint**:

| Check | Mobile <768 | Tablet 768–1279 | Desktop ≥1280 |
|---|---|---|---|
| Notebook line alignment ±1px | ✓ | ✓ | ✓ |
| Modal không bị cắt | ✓ | ✓ | ✓ |
| Table không tràn viewport | ✓ | ✓ | ✓ |
| Font size đọc được (≥14px) | ✓ | ✓ | ✓ |
| Tap target ≥44px | ✓ | ✓ | — |
| Scroll mượt | ✓ | ✓ | ✓ |
| Không có horizontal scrollbar ngoài ý muốn | ✓ | ✓ | ✓ |

---

#### PHASE 9 — RTL Layout (nếu applicable)

- [ ] Khi switch sang RTL: toàn bộ layout mirror đúng (flex-direction, text-align, padding/margin)
- [ ] Icon có hướng (arrow, chevron) flip đúng trong RTL
- [ ] Notebook: text bắt đầu từ phải, đường kẻ vẫn full-width
- [ ] Modal, table: không bị vỡ layout trong RTL
- [ ] `dir="rtl"` trên `<html>` hoặc container — không dùng CSS transform hack

---

#### Output format bắt buộc

```json
{
  "iteration": 2,
  "timestamp": "2025-01-15T10:32:00Z",
  "status": "fail | pass | pass_with_warning",
  "screenshot_ref": "iter2_desktop.png",
  "diff_ref": "iter2_diff.png",
  "phases_passed": ["PHASE0", "PHASE1", "PHASE3"],
  "phases_failed": ["PHASE2", "PHASE5"],
  "issues": [
    {
      "phase": "PHASE2",
      "type": "alignment | overflow | logic | UX | animation | z-index | focus | gesture | rtl",
      "description": "Modal bị che bởi sidebar, z-index sidebar=999 > modal=100",
      "severity": "low | medium | high",
      "breakpoint": "mobile | tablet | desktop | all",
      "fix_hint": "Tăng z-index modal lên 1000, kiểm tra stacking context"
    }
  ]
}
```

---

### ⚙️ ORCHESTRATOR

**Logic quyết định:**

```
IF status == "pass"
  → EXIT: deploy

IF high_severity_count > 0 AND loop < MAX_LOOP
  → RETRY: gửi issues về CODER + LOG iteration + timestamp

IF high_severity_count > 0 AND loop >= MAX_LOOP
  → ESCALATE: revert snapshot + flag human review

IF high_severity_count == 0 AND low_severity_count <= 3
  → EXIT: pass_with_warning (ghi log)

IF high_severity_count == 0 AND low_severity_count > 3
  → RETRY
```

**Snapshot:** Sau mỗi CODER output → lưu snapshot (version + code state).

---

## 3. Loop Process

```
Loop N (max 5):
  1. CODER        → đọc USER_REQUEST + issues[N-1] → output code vN.x + snapshot
  2. TESTER       → chạy PHASE 0–9 đầy đủ → output status + issues[N]
  3. ORCHESTRATOR → evaluate → retry | pass | pass_with_warning | escalate
```

---

## 4. Exit Criteria (STRICT)

| Tiêu chí | Điều kiện |
|---|---|
| Text alignment | ±1px với notebook lines |
| Font rendering | Không blurry, đúng font, đúng line-height |
| Layout | Không vỡ trên cả 3 breakpoint |
| Modal animation | 150–300ms, không jank, FPS ≥55 |
| Z-index | Modal luôn trên cùng, không conflict |
| Focus trap | Hoạt động đúng trong modal |
| UI overlap | Không có |
| Page flip | Không break content flow |
| Scroll | Mượt 60fps, không duplicate (infinite) |
| Touch target | ≥44×44px trên mobile |
| Date format | dd/mm/yyyy |

---

## 5. Special Rules

- Không redesign trừ khi TESTER report `type: "UX"` với `severity: "high"`
- Chỉ sửa đúng issue được report — không sửa thêm
- Mỗi iteration phải có `timestamp` để audit sau
- TESTER phải đính kèm `screenshot_ref` + `diff_ref` + `phases_failed` khi fail
- `pass_with_warning` vẫn được deploy nhưng phải ghi log đầy đủ
- RTL chỉ test nếu app có hỗ trợ đa ngôn ngữ RTL