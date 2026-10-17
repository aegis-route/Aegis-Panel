# 🌐 Aegis-Panel: Kế Hoạch & Thiết Kế Kiến Trúc Bảng Quản Trị Trung Tâm (Web Plan)

> **Dự án**: Aegis Network Security Suite  
> **Phân hệ**: Aegis-Panel (VM 104 - IP Quy hoạch: `192.168.100.10`)  
> **Phiên bản kế hoạch**: v1.0.0-PROD  
> **Trạng thái**: Bản thiết kế kỹ thuật & Lộ trình triển khai (Master Architecture & Implementation Blueprint)  

---

## 📌 1. Tầm Nhìn & Mục Tiêu Dự Án (Executive Summary)

**Aegis-Panel** đóng vai trò là **"Bộ não điều khiển trung tâm" (Central Unified Control Plane)** hợp nhất toàn bộ 3 phân hệ mạng độc lập của hệ thống Aegis:
1. **Aegis-KernelFW (VM 101)**: Lõi Firewall XDP/eBPF chặn đứng 10 loại tấn công ngay tại tầng card mạng NIC.
2. **MikroTik RouterOS CHR (VM 102)**: Bộ định tuyến trung tâm quản lý WAN, PPPoE, DHCP, NAT và QoS.
3. **AdGuard Home (VM 103)**: Máy chủ DNS lọc tên miền độc hại, chặn quảng cáo, kiểm soát trẻ em và ứng dụng.

### Triết lý Phát triển
- **Design-First / Frontend-Driven**: Thiết kế giao diện trực quan trước với Mock Data hoàn chỉnh để định hình trải nghiệm người dùng (UX) và chốt cứng chuẩn API (API Contracts) trước khi ghép nối backend.
- **Thẩm mỹ Dark Cyber-NOC (Network Operations Center)**: Giao diện tối hiện đại, đậm chất an ninh mạng, biểu đồ trực quan, hỗ trợ màn hình Live Monitor cập nhật theo thời gian thực (Real-time WebSocket/SSE) độ trễ < 1 giây.
- **Zero-WinBox Dependency**: Người quản trị gia đình / doanh nghiệp nhỏ có thể vận hành mạng, mở cổng NAT, khóa IP, chặn TikTok/Game mà không cần cài đặt phần mềm chuyên sâu WinBox hay gõ lệnh Linux phức tạp.

---

## 🏗️ 2. Kiến Trúc Công Nghệ (Technology Stack)

```mermaid
graph TB
    subgraph Client ["Client Browser (Admin / Staff)"]
        UI["Aegis Web UI<br/>(Next.js 15 + React 19 + Tailwind CSS)"]
    end

    subgraph VM104 ["VM 104: Aegis-Panel (192.168.100.10)"]
        BFF["Aegis Backend / API Coordinator<br/>(Fastify / Next.js API Routes + WebSocket)"]
        DB[("Local SQLite + Cache<br/>(Settings, Audit Logs, Staff Auth)")]
    end

    subgraph VM101 ["VM 101: Aegis-KernelFW"]
        BPF["BPF Maps (/sys/fs/bpf/aegis/*)<br/>10 Methods Dropped Counters & Dynamic Ban"]
    end

    subgraph VM102 ["VM 102: MikroTik CHR"]
        ROS["RouterOS REST API / API-SSL (8729)<br/>WAN Status, DHCP Leases, Port Forwards"]
    end

    subgraph VM103 ["VM 103: AdGuard Home"]
        ADG["AdGuard REST API (/control/*)<br/>Query Logs, App Blocker, SafeSearch"]
    end

    UI <==>|REST / WSS (Realtime)| BFF
    BFF --- DB
    BFF <==>|Local Unix Socket / SSH / Sysfs| BPF
    BFF <==>|HTTPS REST API| ROS
    BFF <==>|HTTP / HTTPS REST| ADG
```

| Tầng (Layer) | Công nghệ lựa chọn | Lý do sử dụng |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router, React 19, TypeScript)** | Chuẩn công nghiệp hiện đại, tối ưu SEO/SSR, hỗ trợ cả Client & Server Components, tích hợp sẵn API Routes làm BFF. |
| **Styling & Design System** | **Tailwind CSS v3/v4 + Radix UI Primitives** | Tùy biến bảng màu Cyber Dark Mode, glassmorphism, micro-animations mượt mà, responsive trên cả máy tính và di động. |
| **Data Visualization** | **Recharts & Lucide React** | Biểu đồ vùng (Area Chart), biểu đồ cột (Bar Chart) hiển thị lưu lượng mạng, PPS, Top DNS domains mượt mà. |
| **Backend & Coordinator** | **Fastify / Next.js Route Handlers + TypeScript** | Tốc độ xử lý I/O cực cao (< 1ms overhead), hỗ trợ WebSocket streaming số liệu mỗi 1 giây. |
| **Data Storage** | **SQLite (via Prisma / Drizzle ORM)** | Nhẹ, không tốn tài nguyên RAM, lưu trữ cấu hình bảng điều khiển, tài khoản Staff, lịch sử Audit Log. |
| **Realtime Engine** | **WebSocket (`ws`) hoặc Server-Sent Events (SSE)** | Đẩy dữ liệu lưu lượng mạng (PPS, Mbps, Attack Alerts) trực tiếp xuống trình duyệt mà không cần spam polling. |

---

## 🖥️ 3. Cấu Trúc Giao Diện & Đặc Tả 5 Phân Hệ Màn Hình (Sitemap & UX)

Aegis-Panel được chia thành **5 màn hình chính** với thanh điều hướng (Sidebar Navigation) cố định bên trái:

```text
Aegis Control Panel
├── 1. 📊 NOC Dashboard (Overview)       - Tổng quan sức khỏe mạng & cảnh báo khẩn cấp
├── 2. 🛡️ Kernel Firewall (Aegis-XDP)    - Giám sát 10 Module XDP, Bảng Ban, Whitelist/Blacklist
├── 3. 🌐 Router Gateway (MikroTik CHR)  - Quản lý WAN, danh sách thiết bị DHCP, Port Forwarding
├── 4. 🔍 DNS Security (AdGuard Home)    - Bộ lọc tên miền, 1-Click App Blocker, Lịch giới hạn
└── 5. ⚙️ System Settings & Audit Logs   - Quản trị Staff, bảo mật 2FA, cấu hình thông báo Bot
```

---

### Màn hình 1: 📊 NOC Dashboard (Overview Trung Tâm)

Màn hình đầu tiên khi đăng nhập, cung cấp cái nhìn 360 độ về toàn bộ mạng:

1. **Thanh trạng thái 4 Máy ảo (4-Node Cluster Health Banner)**:
   - `VM 101: Aegis-KernelFW`: Trạng thái [ONLINE], Interface `eth0` Inbound Active.
   - `VM 102: MikroTik CHR`: Trạng thái [ONLINE], IP WAN thực tế, Uptime, CPU Usage.
   - `VM 103: AdGuard Home`: Trạng thái [ONLINE], Tỷ lệ chặn tên miền (%).
   - `VM 104: Web Control`: Trạng thái [ONLINE], Phiên bản Panel.
2. **Biểu đồ Lưu lượng mạng Thời gian thực (Realtime Traffic Waveform)**:
   - Đường cong kép hiển thị: **Inbound Traffic (Mbps)** và **Outbound Traffic (Mbps)**.
   - Chỉ số phụ: **Total Ingress PPS** vs **Total Dropped PPS**.
3. **Thanh Cảnh báo Tấn công Nhanh (Attack Flash Alert)**:
   - Khi phát hiện một trong 10 phương thức XDP kích hoạt drop liên tục > 1000 pps, thanh cảnh báo nhấp nháy đỏ: *"Phát hiện đợt tấn công SYN Flood / UDP Junk từ IP x.x.x.x - Đã tự động chặn!"*.
4. **Bộ Phím Tắt Khẩn Cấp (Quick Panic Actions)**:
   - 🔴 **Nút "Emergency Lockdown"**: Chuyển Firewall về chế độ Default DROP (chỉ cho phép Whitelist).
   - 🟡 **Nút "Family Focus Mode"**: Kích hoạt AdGuard chặn toàn bộ Mạng xã hội & Game ngay lập tức.
   - 🟢 **Nút "Reset All Meters"**: Xóa sạch bộ đếm tạm thời để bắt đầu phiên đo mới.

---

### Màn hình 2: 🛡️ Kernel Firewall (Aegis-XDP Defense)

Màn hình điều khiển chuyên sâu cho lõi eBPF/XDP của `Aegis-KernelFW`:

1. **Lưới Đếm 10 Phương Thức Phòng Thủ (10-Module Mitigation Grid)**:
   - Hiển thị 10 thẻ (Cards) tương ứng với 10 phương thức độc lập:
     - **Card 01 (Malformed)**: Số gói hỏng / header lỗi đã drop.
     - **Card 02 (Bogon & Spoof)**: Số gói IP giả mạo / Land Attack đã drop.
     - **Card 03 (Fragmented)**: Số gói phân mảnh Teardrop đã drop.
     - **Card 04 (Invalid TCP Flags)**: Số gói quét cổng Stealth Scan đã drop.
     - **Card 05 (SYN Flood)**: Số gói SYN vượt ngưỡng PPS đã drop.
     - **Card 06 (Out-of-state)**: Số gói ACK/RST cổng đóng đã drop.
     - **Card 07 (UDP Junk)**: Số gói UDP rác cổng đóng đã drop.
     - **Card 08 (ICMP Flood)**: Số gói Ping flood đã drop.
     - **Card 09 (Reflected Flood)**: Số gói phản xạ DNS/NTP dội về đã drop.
     - **Card 10 (Dynamic Ban)**: Số gói bị drop do IP đang trong danh sách cấm tự động.
   - Mỗi thẻ đều có **Switch Toggle** để bật/tắt module tương ứng theo thời gian thực (`aegis-fw feature enable/disable`).
2. **Bảng Danh Sách IP Bị Tự Động Cấm (Dynamic Auto-Ban Table)**:
   - Cột: `Địa chỉ IP`, `Thời gian cấm còn lại (giây)`, `Lý do vi phạm`, `Số gói đã chặn`.
   - Nút hành động: **[Unban Ngay]** (mở khóa lập tức mà không cần đợi hết hạn) và **[Chuyển Sang Blacklist Vĩnh Viễn]**.
3. **Quản lý Rule CIDR Tĩnh (LPM Trie Table)**:
   - Tab **Whitelist** (Ưu tiên đi thẳng, bỏ qua kiểm tra).
   - Tab **Blacklist** (Chặn đứng vĩnh viễn subnet hoặc IP).
   - Form thêm nhanh: Nhập CIDR (ví dụ `192.168.1.0/24` hoặc `1.2.3.4/32`) và ghi chú.
4. **Cổng Dịch Vụ Mở (Whitelisted Service Ports - Methods 6 & 7)**:
   - Danh sách các cổng TCP/UDP đang được phép nhận kết nối (ví dụ TCP 80, 443; UDP 53, 51820). Cho phép thêm cổng mới chỉ với 1 click.

---

### Màn hình 3: 🌐 Router Gateway (MikroTik CHR Management)

Giao diện điều khiển MikroTik trực quan, loại bỏ hoàn toàn sự rườm rà của WinBox:

1. **Trạng thái Kết nối Internet (WAN Connection Card)**:
   - Loại kết nối: PPPoE Client hoặc DHCP Client.
   - Địa chỉ IP WAN công khai, Gateway, Uptime của session.
   - Chỉ số Ping Latency đến 8.8.8.8 và 1.1.1.1 (đo đạc độ ổn định đường truyền mạng).
2. **Quản lý Thiết Bị Đang Kết Nối (DHCP Client Leases)**:
   - Bảng danh sách thiết bị trong LAN (`192.168.1.0/24`):
     - `Tên thiết bị (Hostname)`, `Địa chỉ IP`, `Địa chỉ MAC`, `Trạng thái (Active/Static)`.
     - Thống kê tốc độ Upload / Download hiện tại của thiết bị.
     - Nút: **[Cố định IP (Make Static)]** — gắn chặt IP với MAC chỉ với 1 click.
     - Nút: **[Giới hạn băng thông (QoS Rate Limit)]** — đặt max 10Mbps/20Mbps cho thiết bị.
3. **Quản lý Chuyển tiếp Cổng (Port Forwarding / NAT Manager)**:
   - Bảng quy tắc DST-NAT: `Tên dịch vụ`, `Port ngoài (WAN)`, `IP nội bộ`, `Port trong`, `Giao thức (TCP/UDP)`.
   - Form thêm mới thân thiện (có sẵn mẫu gợi ý: Web Server, Minecraft, Camera RTSP, Plex,...).

---

### Màn hình 4: 🔍 DNS Security & Parental Control (AdGuard Home Engine)

Hệ thống DNS Gateway bảo mật toàn diện kế thừa và tối ưu hóa 100% tính năng lõi của AdGuard Home:

1. **Tổng Quan & Thống Kê (Dashboard & Metrics)**:
   - **4 Bộ Đếm Chỉ Số (KPI Summary)**:
     - *Tổng số truy vấn DNS (DNS Queries)*: ví dụ 1,248,930 truy vấn trong 24 giờ.
     - *Bị chặn bởi bộ lọc (Blocked by Filters)*: số lượng và tỷ lệ % (ví dụ: 184,200 - 14.7%).
     - *Trang web độc hại/lừa đảo bị chặn (Blocked Malware & Phishing)*.
     - *Trang web người lớn/khiêu dâm bị chặn (Blocked Adult Websites)*.
   - **Biểu đồ thời gian thực & Phân tích chuyên sâu**:
     - *Top Clients*: Danh sách IP máy trạm gửi nhiều truy vấn nhất, hostname, số request, nút gán hồ sơ cố định.
     - *Top Queried Domains*: Tên miền được truy vấn nhiều nhất toàn mạng (Apple, Google, Cloudflare, Shopee...).
     - *Top Blocked Domains*: Tên miền quảng cáo/theo dõi bị đánh chặn nhiều nhất (doubleclick, tracking, telemetry...).
     - *Top Upstream DNS Latency*: Đo lường thời gian phản hồi trung bình của từng upstream server (Cloudflare 1.1.1.1: 8ms, Google 8.8.8.8: 14ms, Quad9: 19ms).
     - *Thời gian xử lý trung bình*: Average processing time per query (ms).

2. **Chặn Ứng Dụng Theo Chuyên Mục & Lịch Trình (Blocked Services & Scheduling)**:
   - **Phân nhóm dịch vụ chuyên sâu (11 Categories)**:
     - 🤖 **Trí tuệ nhân tạo (AI)**: ChatGPT, Claude, Google Gemini, DeepSeek, Copilot, Perplexity.
     - 🎮 **Trò chơi trực tuyến (Gaming)**: Steam, Roblox, Riot Games (LoL/Valorant), Epic Games, PlayStation, Xbox, Nintendo.
     - 📱 **Mạng xã hội (Social Networks)**: TikTok, Facebook, Instagram, X (Twitter), Reddit, Threads, Pinterest, LinkedIn.
     - 📺 **Truyền thông & Phim ảnh (Streaming)**: YouTube, Netflix, Spotify, Twitch, Disney+, HBO Max, SoundCloud.
     - 💬 **Ứng dụng nhắn tin (Messaging)**: Discord, Telegram, WhatsApp, Viber, Signal, Skype.
     - 💘 **Ứng dụng hẹn hò (Dating)**: Tinder, Bumble, Badoo, Grindr.
     - 🎰 **Cờ bạc & Cá cược (Gambling)**: Bet365, 1xBet, PokerStars, Kubet, 888casino.
     - 🛍️ **Thương mại điện tử (Shopping)**: Shopee, Lazada, Tiki, Amazon, AliExpress.
     - 🛡️ **Công cụ ẩn danh & VPN (Privacy Tools)**: Tor, ProtonVPN, NordVPN, Mullvad, ExpressVPN.
     - 💻 **Lập trình & Cloud Hosting**: GitHub, GitLab, Docker, Vercel, Cloudflare Pages.
   - **Tính năng điều khiển nhanh**:
     - Nút **[Chặn tất cả / Mở tất cả]** cho từng chuyên mục riêng biệt.
     - **Lịch trình tạm dừng chặn (Pause Service Blocking Schedule)**: Cài đặt khung giờ giải trí hàng ngày/cuối tuần (ví dụ: Tạm mở TikTok & Game từ 19:00 - 21:30 hàng ngày, ngoài khung giờ tự động kích hoạt chặn).

3. **Danh Sách Bộ Lọc & Công Cụ Chẩn Đoán (Filters, Blocklists & Diagnostic Tool)**:
   - **DNS Blocklists**:
     - Quản lý các URL bộ lọc danh tiếng: AdGuard Base Filter, OISD Full, ChongLuaDao Vietnam (Chống lừa đảo VN), Dan Pollock's Hosts.
     - Hiển thị số lượng rules, thời gian cập nhật lần cuối, switch bật/tắt từng bộ lọc, nút "Kiểm tra cập nhật ngay".
   - **DNS Allowlists**:
     - Danh sách ngoại lệ (Whitelists) cho phép vượt qua mọi rào cản chặn.
   - **Custom Filtering Rules**:
     - Trình soạn thảo văn bản hỗ trợ chuẩn cú pháp Adblock (`||domain^`, `@@||whitelist.com^`, regex `/bad.*pattern/`, hosts format `0.0.0.0 malicious.site`).
   - **Công cụ Kiểm Tra Bộ Lọc (Check the Filtering Diagnostic)**:
     - Ô nhập tên miền để kiểm tra trực tiếp (ví dụ gõ: `tiktokv.com` hoặc `chatgpt.com`).
     - Hệ thống kiểm tra ngay lập tức: Báo kết quả xem tên miền có bị chặn không, bị chặn bởi bộ lọc hay dịch vụ nào, khớp rule nào, và cung cấp nút 1-click Unblock / Add Whitelist.

4. **DNS Rewrites & Cấu Hình Bộ Nhớ Đệm (Rewrites, Cache & Access Control)**:
   - **DNS Rewrites (Ánh xạ tên miền tùy biến)**:
     - Tạo bản ghi nội bộ chuyển hướng trực tiếp domain sang IP đích LAN (ví dụ: `*.home.local` -> `10.0.0.1`, `nas.aegis` -> `192.168.1.100`, `proxmox.lan` -> `192.168.1.5`).
   - **Cấu hình DNS Cache**:
     - Kích thước Cache RAM (ví dụ: 64 MB / 4,194,304 bytes).
     - Ghi đè TTL tối thiểu (Override Minimum TTL: ví dụ 300 giây).
     - Ghi đè TTL tối đa (Override Maximum TTL: ví dụ 86,400 giây).
     - **Optimistic Caching (Bộ nhớ đệm lạc quan)**: AdGuard trả về kết quả đã hết hạn ngay lập tức trong 0ms cho client và âm thầm truy vấn cập nhật ngầm, giúp trải nghiệm duyệt web siêu tốc.
   - **Access Settings (Kiểm soát quyền truy cập)**:
     - Danh sách máy trạm được phép truy vấn (Allowed Clients CIDR).
     - Danh sách máy trạm bị cấm truy vấn (Disallowed Clients).
     - Tên miền bị cấm truy vấn tuyệt đối (Disallowed Domains).

5. **Cấu Hình Động Cơ DNS & Upstream Servers (Engine & Encryption)**:
   - **Upstream DNS Servers**:
     - Hỗ trợ đầy đủ các giao thức mã hóa hiện đại: DNS-over-HTTPS (`https://...`), DNS-over-TLS (`tls://...`), DNS-over-QUIC (`quic://...`), DNSCrypt, UDP/TCP truyền thống.
     - **Chế độ cân bằng truy vấn (Upstream Mode)**:
       * *Cân bằng tải (Load-balancing)*: Phân phối xoay vòng.
       * *Truy vấn song song (Parallel requests)*: Gửi đồng thời tới tất cả upstreams và lấy câu trả lời sớm nhất.
       * *IP nhanh nhất (Fastest IP)*: Truy vấn đồng thời và ping chọn IP có latency thấp nhất.
     - Fallback DNS Servers & Bootstrap DNS Servers & Private Reverse DNS Servers.
   - **Thiết lập an ninh DNS Engine**:
     - Giới hạn tốc độ truy vấn (Rate limit RPS per client: ngăn chặn DNS amplification).
     - DNSSEC validation (Xác thực chữ ký số DNS).
     - EDNS Client Subnet (ECS) pass-through.
     - Vô hiệu hóa phân giải IPv6 (Disable resolving AAAA records khi mạng LAN không dùng IPv6).
     - **Chế độ chặn (Blocking Mode)**: Lựa chọn trả về Default (0.0.0.0), REFUSED, NXDOMAIN, Null IP hoặc Custom IP (chuyển hướng sang trang cảnh báo Aegis Block Page).
   - **Mã hóa kết nối (Encryption Settings - DoH/DoT/DoQ Gateway)**:
     - Kích hoạt máy chủ DoH (port 443), DoT (port 853), DoQ (port 853) cho mạng nội bộ.
     - Quản lý chứng chỉ SSL/TLS (Certificate & Private Key).
   - **Hồ sơ Thiết Bị Cố Định (Client Profiles)**:
     - Quản lý Persistent Clients: Gán tên, IP/MAC, nhãn tags (Trẻ em, Khách, Thiết bị IoT, Server), gán chính sách chặn và Upstream DNS chuyên biệt cho từng thiết bị.

6. **Nhật Ký Truy Vấn Thời Gian Thực (Query Log Explorer)**:
   - Thanh tìm kiếm và bộ lọc đa chiều (Search by domain, client IP; Filter by All, Processed, Blocked by filter, Blocked by service, Rewritten).
   - Bảng dữ liệu chi tiết từng truy vấn:
     - *Thời gian*: Timestamp chính xác đến từng mili-giây.
     - *Tên miền & Loại bản ghi*: Domain, Type (A, AAAA, HTTPS, TXT).
     - *Trạng thái phản hồi*: Trả về thành công (200 OK), Chặn bởi danh sách lọc, Chặn bởi dịch vụ, Ánh xạ Rewrite.
     - *Client*: IP máy trạm và tên thiết bị.
     - *Upstream*: Máy chủ DNS đã xử lý và độ trễ (ví dụ: `1.1.1.1 (8ms)` hoặc `Cache (0ms)`).
     - *Hành động nhanh (Quick Actions)*: Nút 1-click **[Chặn (Block)]** hoặc **[Mở (Unblock)]** trực tiếp trên từng hàng.

---

### Màn hình 5: ⚙️ System Settings & Audit Logs

Bảo mật quản trị tối đa theo chuẩn AdGuard Home:

1. **Kiến Trúc Xác Thực 1 User Duy Nhất (AdGuard Home Single Administrator Standard)**:
   - Hệ thống đóng kín: Duy trì đúng **1 tài khoản Root Admin duy nhất** (`admin`), loại bỏ hoàn toàn các tài khoản phụ/staff để triệt tiêu nguy cơ leo thang đặc quyền (Privilege Escalation).
   - Màn hình đăng nhập Cyber Shield toàn màn hình (`#login-screen`), bảo vệ toàn bộ phân hệ Aegis khỏi truy cập trái phép.
   - Quản lý phiên làm việc tập trung (Session Token) kèm dropdown Profile tại Topbar: Đổi mật khẩu admin, Cài đặt bảo mật, Đăng xuất khỏi mọi thiết bị.
   - Đổi mật khẩu có kiểm tra độ mạnh (Password Strength Meter) và lưu trữ cục bộ bảo mật.
2. **Nhật Ký Hoạt Động (Audit Logs)**:
   - Ghi lại đầy đủ mọi thay đổi: `Thời gian`, `Tài khoản thực hiện (admin)`, `Hành động` (ví dụ: *Admin unban IP 185.220.101.4*, *Admin bật chặn BitTorrent*, *Admin cấu hình DHCP Static*).
3. **Cấu hình Cảnh báo Tự động (Alert Webhooks)**:
   - Tích hợp Telegram Bot hoặc Discord Webhook: Gửi tin nhắn thông báo khi đường truyền WAN bị rớt, cảnh báo xác thực sai mật khẩu hoặc khi có đòn DDoS lớn bị XDP triệt hạ.

---

## 📡 4. Chuẩn Định Dạng API Contracts (Backend-For-Frontend)

Toàn bộ giao tiếp giữa Frontend và Backend Coordinator tuân theo chuẩn RESTful JSON và WebSocket:

### 1. REST Endpoints

```typescript
// 1. Firewall Endpoints (Aegis-KernelFW)
GET    /api/firewall/stats              // Lấy toàn bộ bộ đếm 10 methods và băng thông
GET    /api/firewall/features           // Lấy danh sách trạng thái bật/tắt 10 methods
POST   /api/firewall/features/toggle    // Bật/tắt 1 method { feature: "frag", enable: true }
GET    /api/firewall/bans               // Lấy danh sách Dynamic Banned IPs
POST   /api/firewall/bans/clear         // Gỡ ban { ip: "192.168.1.100" }
GET    /api/firewall/rules/cidr         // Lấy danh sách Whitelist & Blacklist CIDR
POST   /api/firewall/rules/cidr         // Thêm rule { type: "blacklist", cidr: "45.33.32.156/32" }
DELETE /api/firewall/rules/cidr         // Xóa rule CIDR
GET    /api/firewall/ports              // Lấy danh sách port mở TCP/UDP
POST   /api/firewall/ports              // Thêm port mở { proto: "tcp", port: 80 }
DELETE /api/firewall/ports              // Xóa port mở

// 2. Router Endpoints (MikroTik CHR)
GET    /api/router/wan                  // Trạng thái đường truyền WAN, IP, Uptime
GET    /api/router/leases               // Danh sách thiết bị DHCP LAN
POST   /api/router/leases/make-static   // Đặt IP tĩnh { mac: "xx:xx:xx", ip: "192.168.1.50" }
POST   /api/router/leases/rate-limit    // Đặt QoS giới hạn tốc độ { ip: "192.168.1.50", maxRate: "10M" }
GET    /api/router/nat                  // Danh sách Port Forwarding rules
POST   /api/router/nat                  // Tạo rule Port Forward mới
DELETE /api/router/nat/:id              // Xóa rule Port Forward

// 3. DNS Endpoints (AdGuard Home Engine)
GET    /api/dns/stats                   // Thống kê tổng quan: queries, blocked_count, malware, adult, avg_latency
GET    /api/dns/top-stats               // Top clients, top queried domains, top blocked domains, upstreams
GET    /api/dns/blocked-services        // Danh sách trạng thái 11 nhóm ứng dụng (AI, Gaming, Social, etc.)
POST   /api/dns/blocked-services/toggle // Chặn/Mở 1 app { service: "tiktok", blocked: true }
POST   /api/dns/blocked-services/group  // Chặn/Mở cả nhóm { category: "gaming", blocked: true }
GET    /api/dns/schedule                // Cấu hình lịch trình tạm dừng chặn (Pause Schedule)
POST   /api/dns/schedule                // Cập nhật lịch trình tạm dừng chặn
GET    /api/dns/filters/blocklists      // Danh sách URL bộ lọc chặn (AdGuard, OISD, ChongLuaDao)
POST   /api/dns/filters/blocklists      // Thêm URL bộ lọc mới { name, url, enabled }
POST   /api/dns/filters/update          // Kích hoạt cập nhật tải lại toàn bộ bộ lọc
GET    /api/dns/filters/custom          // Lấy danh sách quy tắc Adblock tùy biến
POST   /api/dns/filters/custom          // Lưu danh sách quy tắc Adblock tùy biến
POST   /api/dns/filters/check           // Kiểm tra 1 domain { domain: "tiktokv.com" } -> trả về kết quả chẩn đoán
GET    /api/dns/rewrites                // Danh sách ánh xạ DNS Rewrites nội bộ
POST   /api/dns/rewrites                // Tạo mới bản ghi DNS Rewrite { domain, answer }
DELETE /api/dns/rewrites/:id            // Xóa bản ghi DNS Rewrite
GET    /api/dns/cache                   // Thông số bộ nhớ đệm (size, min_ttl, max_ttl, optimistic)
POST   /api/dns/cache                   // Cập nhật thông số bộ nhớ đệm
GET    /api/dns/engine/config           // Cấu hình upstream, mode, rate limit, blocking mode, DNSSEC
POST   /api/dns/engine/config           // Lưu cấu hình engine & upstreams
POST   /api/dns/engine/test-upstreams   // Kiểm tra kết nối và độ trễ các server upstream
GET    /api/dns/querylog                // Truy vấn lịch sử query log { limit: 50, search: "", filter: "blocked" }

// 4. System & Auth Endpoints
POST   /api/auth/login                  // Đăng nhập Staff { username, password, totpCode }
GET    /api/auth/me                     // Thông tin phiên làm việc
GET    /api/system/audit-logs           // Xem lịch sử Audit Log
GET    /api/system/health               // Kiểm tra trạng thái ping 4 máy ảo
```

### 2. WebSocket Realtime Stream (`/ws/live-feed`)
Mỗi 1000ms (1 giây), Server đẩy một gói tin tổng hợp xuống client:
```json
{
  "timestamp": 1791850123000,
  "traffic": {
    "inbound_mbps": 42.5,
    "outbound_mbps": 18.2,
    "total_pps": 12450,
    "dropped_pps": 350
  },
  "xdp_dropped_delta": {
    "malformed": 0,
    "bogon": 12,
    "frag": 0,
    "tcp_flags": 4,
    "syn_flood": 280,
    "out_of_state": 0,
    "udp_junk": 54,
    "icmp_flood": 0,
    "reflected": 0,
    "rate_limit": 0,
    "dynamic_ban": 0
  },
  "active_bans_count": 3,
  "dns_qps": 85
}
```

---

## 🎨 5. Quy Chuẩn Thẩm Mỹ & Thiết Kế (Design System & Tokens)

Để bảng điều khiển đạt chuẩn cao cấp và tạo ấn tượng mạnh mẽ ("WOW Effect"):

- **Theme Palette (Cyber Dark Theme)**:
  - Background chính: `#0B0F17` (Deep Obsidian Void).
  - Surface Card: `#111827` với border viền tinh tế `#1F2937` hoặc viền phát quang mờ `#0EA5E9/20`.
  - Accent Primary: `#0EA5E9` (Cyan Laser) và `#38BDF8` (Sky Tech).
  - Status Success: `#10B981` (Emerald Shield).
  - Status Warning: `#F59E0B` (Amber Alert).
  - Status Danger/Attack: `#EF4444` (Crimson Breach).
- **Typography**: Google Font **Inter** hoặc **JetBrains Mono** cho các chỉ số kỹ thuật, địa chỉ IP và địa chỉ MAC.
- **Glassmorphism & Depth**: Hiệu ứng phủ mờ `backdrop-blur-md` trên header và modal điều khiển.
- **Micro-Animations**: Hiệu ứng chuyển động mượt mà khi switch toggle, counter tăng số mượt (odometer effect), cảnh báo pulse phát sáng khi có đòn tấn công.

---

## 🗺️ 6. Lộ Trình Phát Triển 5 Giai Đoạn (Implementation Phases)

```text
Giai đoạn 1: Khởi tạo Bộ khung & Design System (Frontend Core)
├── Khởi tạo dự án Next.js 15 (TypeScript, Tailwind CSS, Lucide, Recharts)
├── Xây dựng Layout tổng thể: Sidebar, Header, Notification Toast, Dark Theme tokens
└── Tạo thư viện Mock Data Provider hoàn chỉnh cho cả 5 phân hệ

Giai đoạn 2: Phát triển Toàn diện 5 Màn hình Giao diện (Interactive UI)
├── Màn hình 1: NOC Overview (Biểu đồ traffic realtime giả lập, 4-node status)
├── Màn hình 2: Kernel Firewall (Lưới 10 Modules XDP, Bảng Dynamic Ban, Whitelist)
├── Màn hình 3: RouterOS Manager (WAN card, Bảng thiết bị DHCP, NAT port manager)
├── Màn hình 4: DNS Security (Top queries, 1-Click App Blocker toggle, Schedule)
└── Màn hình 5: System Settings & Audit Logs (Form login, 2FA setup, Audit log)

Giai đoạn 3: Xây dựng Backend Adapter Services (Coordinator BFF)
├── Adapter 1: KernelFW Service (Đọc pinned BPF maps qua local CLI/Unix socket)
├── Adapter 2: MikroTik Service (Kết nối qua RouterOS REST API / RouterOS-API client)
└── Adapter 3: AdGuard Service (Gọi HTTP REST Client tới endpoint /control/*)

Giai đoạn 4: Ghép nối Realtime & End-to-End Integration
├── Thiết lập WebSocket server stream số liệu từ KernelFW & RouterOS
├── Chuyển đổi Frontend từ Mock Data sang Live Data từ Backend
└── Kiểm thử tính phản hồi tức thì của các thao tác Toggle / Ban / Unban

Giai đoạn 5: Đóng gói Triển khai & Tối ưu hóa (Production Readiness)
├── Tạo Dockerfile & docker-compose.yml nhẹ tối ưu hóa cho VM 104
├── Thiết lập bảo mật reverse proxy HTTPS (Caddy / Nginx) với SSL nội bộ
└── Kiểm thử tải và hoàn thiện tài liệu hướng dẫn vận hành
```

---

## ✅ 7. Kết Luận & Bước Tiếp Theo

Kế hoạch này đảm bảo **Aegis-Panel** là một sản phẩm hoàn chỉnh, vừa đạt độ sâu kỹ thuật để điều khiển các phân hệ phức tạp (Kernel eBPF, RouterOS, DNS), vừa sở hữu giao diện trực quan, thẩm mỹ cao và vận hành tiện lợi.

Toàn bộ quy trình sẽ bắt đầu với **Giai đoạn 1 (Khởi tạo dự án Next.js & Giao diện)** trực tiếp trong thư mục [`/mnt/d/project/Aegis-Panel`](file:///mnt/d/project/Aegis-Panel).
