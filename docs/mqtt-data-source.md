# MQTT Telemetry Data Source — KKC-UFM (Flood IoT KKU)

เอกสารนี้สรุปโครงสร้างข้อมูล MQTT telemetry ของโครงการ KKC-UFM (ระบบตรวจวัดน้ำท่วมเมืองขอนแก่น) จากไฟล์ที่ถูก export ไว้ที่:

```
http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data/
```

## 1. โครงสร้างไดเรกทอรีบนเซิร์ฟเวอร์

Apache directory listing (Apache/2.4.58, Win64, PHP/8.2.12) มี 4 หมวดเซนเซอร์ + ไฟล์อธิบาย topic:

```
transfer_data/telemetry_mqtt_data/
├── pipe/    # ระดับน้ำในท่อระบายน้ำ (Water Pipe)     -> Pipe_01.csv ... Pipe_06.csv
├── road/    # ระดับน้ำท่วมผิวถนน (Water Road)         -> Road_01.csv ... Road_09.csv
├── rain/    # สถานีโทรมาตรฝน/Telemetry รวม (Rain/Telemetry) -> telemetry_<CODE>.csv (15 สถานี)
├── lake/    # ระดับน้ำในบึง/หนองน้ำ (Water Lake)       -> Lake_01.csv ... Lake_06.csv
└── Topic และ ลำดับสถานที่ติดตั้ง.xlsx   # ตาราง mapping topic/สถานที่ติดตั้ง
```

แต่ละโฟลเดอร์มี subfolder `archive/` (และ `rain/` มี `old/` เพิ่ม) สำหรับเก็บไฟล์เก่า และไฟล์ที่ล้มเหลวจะถูก rename เป็น `<ชื่อไฟล์>.corrupt_YYYYMMDD_HHMMSS` (พบทั้งในหมวด pipe, road, rain, lake) แสดงว่ามี job ฝั่งเซิร์ฟเวอร์ที่ดึงข้อความ MQTT มาต่อเป็นไฟล์ CSV แบบต่อเนื่อง และมีกลไก rotate ไฟล์ที่เสียหายออกไปเมื่อดึงข้อมูลผิดพลาด

## 2. Mapping รหัสสถานี ↔ ตำแหน่งติดตั้ง (จาก sheet2 ของไฟล์ .xlsx)

### 2.1 Water Pipe (ระดับน้ำในท่อระบายน้ำ)
| Code | ตำแหน่งติดตั้ง |
|---|---|
| Pipe_01 | ประตูระบายน้ำที่ 5 (ในท่อก่อนเข้า ปตร.5) |
| Pipe_02 | หน้าร้านจิ้มจุ่มริมคลอง |
| Pipe_03 | ประตูระบายน้ำที่ 6 บึงแก่นนคร ตลาดหน้าวัดธาตุ |
| Pipe_04 | ถนนหมอชาญอุทิศ 2 |
| Pipe_05 | ศูนย์วิจัยและเพาะเลี้ยงสัตว์น้ำจืด |
| Pipe_06 | หน้าโรงพยาบาลขอนแก่นราม |

### 2.2 Water Road (ระดับน้ำท่วมผิวถนน)
| Code | ตำแหน่งติดตั้ง |
|---|---|
| Road_01 | ตลาดจอมพล ถนนจอมพล |
| Road_02 | สถานีน้ำมันพีทีที หน้าซอยสวัสดี ถนนมิตรภาพ |
| Road_03 | สำนักทรัพยากรน้ำบาดาลเขต 4 ถนนมิตรภาพ |
| Road_04 | ซอยกังวาน 4 ถนนบ้านกอก |
| Road_05 | หน้าหมู่บ้านชลพฤกษ์ กรีนวิลล์ ถนนศรีจันทร์ |
| Road_06 | โรงเรียนการศึกษาคนตาบอด ขอนแก่น ถนนโยธาธิการ 3035 |
| Road_07 | สถานีน้ำมันเชลล์ เอส พี ขอนแก่น ถนนมะลิวัลล์ |
| Road_08 | ศูนย์วิทยาศาสตร์ทางการแพทย์ที่ 7 ถนนสีหราชเดโชชัย |
| Road_09 | ตลาดหนองไผ่ ถนนโยธาธิการ 2060 |

### 2.3 Water Lake (ระดับน้ำในบึง/หนองน้ำ)
| Code | ตำแหน่งติดตั้ง |
|---|---|
| Lake_01 | สะพาน บ้านทุ่งเศรษฐี (ทางน้ำเปิด) |
| Lake_02 | บึงทุ่งสร้าง |
| Lake_03 | บึงแก่นนคร |
| Lake_04 | คุ้มสีฐาน มหาวิทยาลัยขอนแก่น (ทางน้ำเปิด) |
| Lake_05 | บึงหนองโคตร |
| Lake_06 | หนองเลิงเปือย |

### 2.4 Rain / Telemetry (สถานีฝนและอุตุนิยมวิทยา — ไฟล์ `telemetry_<CODE>.csv`)
| Code | ตำแหน่งติดตั้ง |
|---|---|
| UNE_MC | ศูนย์อุตุนิยมวิทยาภาคตะวันออกเฉียงเหนือตอนบน |
| BTS | โรงสูบน้ำบึงทุ่งสร้าง |
| BKN | โรงสูบบึงแก่นนคร |
| KKC_MUN | เทศบาลนครขอนแก่น |
| NLP | หนองเลิงเปือย |
| BNK | บึงหนองโคตร |
| SIL_MUN | เทศบาลเมืองศิลา |
| MKO_MUN | เทศบาลเมืองเก่า |
| UNE_SH | บ้านพักศูนย์อุตุฯ |
| SNK_HOSP | ตึก RDI (เดิม รพ.ศรีนครินทร์) |
| BSV | หมู่บ้านสีวลี ศรีจันทร์ |
| KKC_BL | โรงเรียนการศึกษาคนตาบอด ขอนแก่น |
| KKC_SP | Sci-Park (มข.) |
| RMUTI | มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน |
| NEU | มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ |

## 3. โครงสร้าง MQTT Topic

รูปแบบ topic: `KKC-UFM/Project <NN>/<Sensor Type>/<Station No.>/<Direction>/<Endpoint>`

ตัวอย่างที่พบจริงในข้อมูล:
```
KKC-UFM/Project 02/Water Pipe/06/GET/data
KKC-UFM/Project 02/Water Road/07/GET/data
KKC-UFM/Project 02/Rain Level/04/GET/data
KKC-UFM/Project 02/Telemetry/06/GET/data
KKC-UFM/Project 02/Telemetry/03/GET/Command   # PUBLISH (สั่งควบคุม)
KKC-UFM/Project 02/Telemetry/03/GET/Config    # SUBSCRIBE (ข้อมูล config อุปกรณ์)
```

- **Project**: แบ่งเป็น `Project 01` และ `Project 02` (ข้อมูล telemetry จริงที่ export มาเป็น Project 02)
- **Sensor Type**: `Telemetry`, `Rain Level`, `Water Level Pipe` (→ `Water Pipe`), `Water Level Road` (→ `Water Road`)
- **Station No.**: เลขลำดับสถานีตามตารางในข้อ 2 (เช่น `03` = Telemetry station ที่ 3)
- **Direction/Endpoint**: `GET/data` (รับค่าตรวจวัด), `GET/Command` (PUBLISH เพื่อสั่งงาน), `GET/Config` (SUBSCRIBE ข้อมูล config/ network ของอุปกรณ์)

## 4. รูปแบบข้อความ MQTT payload (JSON)

ตัวอย่าง payload จริงจาก topic `.../GET/data`:

```json
{
  "Time": "08:54:00",
  "Date": "March 02 2026",
  "Rain": { "Value": 1.2, "Total": 23.6, "Daily": 7.6 },
  "Water": { "Level": 81.90000153, "Flow": 20.5, "Total": 300 },
  "Wind": { "Speed": 2, "Direction": 12, "Direction Name": "W" },
  "Weather": { "Air Temp": 36.59999847, "Air Humid": 37.20000076, "Light": 53572 },
  "V Battery": 13.09599972,
  "I Battery": 217.3000031,
  "SW 01": 1,
  "SW 02": 1,
  "SW 00": 1,
  "Relay Lamp": "0",
  "Relay Horn": "0",
  "Temp": 46.95293808,
  "Humid": 22.63773918,
  "On Time": 34858,
  "Update Time": 15
}
```

สถานีบางประเภทมีฟิลด์เพิ่ม เช่น สถานี Lake จะมี `Water.MSL` (ระดับเทียบ Mean Sea Level)

### 4.1 คำอธิบายพารามิเตอร์

| Parameter | ประเภทข้อมูล | หน่วย/ช่วงค่า | มีใน Water Pipe | มีใน Rain Level | มีใน Water Road | มีใน Telemetry | คำอธิบาย |
|---|---|---|---|---|---|---|---|
| Time | String | HH:MM:SS | ✔ | ✔ | ✔ | ✔ | เวลาของข้อมูล |
| Date | String | Month Day Year | ✔ | ✔ | ✔ | ✔ | วันที่ของข้อมูล |
| Rain.Value | Float | mm/hour, 0–100,000 | – | ✔ | – | – | ปริมาณน้ำฝนปัจจุบัน |
| Rain.Total | Float | mm, 0–100,000 | – | ✔ | – | – | ปริมาณน้ำฝนรวมทั้งหมด |
| Rain.Daily | Float | mm/day, 0–100,000 | – | ✔ | – | – | ปริมาณน้ำฝนรายวัน |
| Water.Level | Float | cm, 0–500 | ✔ | – | ✔ | ✔ | ระดับน้ำ |
| Water.Flow | Float | L/m, 0–100 | ✔ | – | – | – | อัตราการไหลของน้ำ |
| Water.Total | Float | L/m, 0–100,000 | ✔ | – | – | – | ปริมาณน้ำรวมทั้งหมด |
| Wind.Speed | Float | m/s, 0–50 | – | – | – | ✔ | ความเร็วลม |
| Wind.Direction | Integer | 0–15 | – | – | – | ✔ | ทิศทางลม (ตัวเลข) |
| Wind.Direction Name | String | N…NNW, Unknown | – | – | – | ✔ | ทิศทางลม (ชื่อ) |
| Weather.Air Temp | Float | °C, 0–60 | – | ✔ | – | ✔ | อุณหภูมิอากาศ |
| Weather.Air Humid | Float | %, 0–100 | – | ✔ | – | ✔ | ความชื้นในอากาศ |
| Weather.Light | Integer | Lux, 0–200,000 | – | ✔ | – | ✔ | ความเข้มแสง |
| V Battery | Float | V, 0–30 | ✔ | ✔ | ✔ | ✔ | แรงดันแบตเตอรี่ |
| I Battery | Float | mA, 0–3000 | ✔ | ✔ | ✔ | ✔ | กระแสแบตเตอรี่ |
| SW 01 / SW 02 / SW 00 | Integer | 0,1 | ✔ | ✔ | ✔ | ✔ | สถานะสวิตช์ |
| Relay Lamp | String | 0,1 | ✔ | ✔ | ✔ | ✔ | สถานะรีเลย์ไฟสัญญาณ |
| Relay Horn | String | 0,1 | ✔ | ✔ | ✔ | ✔ | สถานะรีเลย์ไซเรน |
| Temp | Float | °C, 0–60 | ✔ | ✔ | ✔ | ✔ | อุณหภูมิภายในกล่องอุปกรณ์ |
| Humid | Float | %, 0–100 | ✔ | ✔ | ✔ | ✔ | ความชื้นภายในกล่องอุปกรณ์ |
| On Time | Integer | min | ✔ | ✔ | ✔ | ✔ | ระยะเวลาเปิดใช้งานสะสม |
| Update Time | Integer | min, 1–60 | ✔ | ✔ | ✔ | ✔ | รอบเวลาส่งข้อมูล (นาที) |

### 4.2 Topic `.../GET/Config` (SUBSCRIBE) — ข้อมูล config อุปกรณ์

```json
{
  "Version": "4.58",
  "boxType": "Sensor 02",
  "macAddress": "34:94:54:15:F2:40",
  "deviceNum": "08",
  "date": "13-Sep-2023 12:00:00",
  "RSSI": -65,
  "ssid": "WiFi_IoT_KKC_UFM",
  "password": "UfM2025KkC",
  "localIP": "192.168.1.108",
  "locationGPS": "16.42, 102.86",
  "locationName": "เทศบาลเมืองเก่า",
  "On Time": 377,
  "Update Time": 15
}
```

> ⚠️ payload นี้มีการฝัง Wi-Fi SSID/รหัสผ่านของอุปกรณ์ตรงๆ — ควรระวังการเปิดเผยไฟล์นี้หรือ log ที่มี topic `GET/Config` ต่อสาธารณะ

### 4.3 Topic `.../GET/Command` (PUBLISH) — ใช้สั่งงาน/ควบคุมอุปกรณ์
ใช้สำหรับควบคุมการแสดงผลข้อมูลในแต่ละสถานี (server → device)

## 5. รูปแบบไฟล์ CSV ที่ export ไว้

ทุกไฟล์ (`Pipe_*.csv`, `Road_*.csv`, `Lake_*.csv`, `telemetry_*.csv`) ใช้ schema เดียวกัน คือ MQTT message ที่ flatten จาก JSON มาเป็นคอลัมน์ พร้อมเก็บ JSON ดิบไว้ในคอลัมน์สุดท้าย:

```
date_time, receive_time, topic, rain_value, rain_total, rain_daily,
water_level, water_flow, water_total,
wind_speed, wind_direction, wind_direction_name,
air_temp, air_humid, light,
v_battery, i_battery,
sw_01, sw_02, sw_00, relay_lamp, relay_horn,
temp, humid, on_time, update_time,
raw_json
```

| คอลัมน์ | ความหมาย |
|---|---|
| `date_time` | เวลาของข้อมูล (ตาม field `Time`/`Date` ใน payload) — ส่วนใหญ่ interval 15 นาที |
| `receive_time` | เวลาที่ server รับ/บันทึกข้อความ MQTT จริง (อาจ delay จาก `date_time` เล็กน้อย) |
| `topic` | MQTT topic เต็มของข้อความนั้น |
| `raw_json` | JSON payload ดิบทั้งก้อนตามข้อ 4 (เก็บไว้เผื่อ field ที่ไม่ได้ flatten เช่น `Water.MSL`) |
| คอลัมน์อื่นๆ | ค่าที่ flatten มาจาก JSON ตรงตามชื่อ (snake_case) |

**ตัวอย่างแถวข้อมูลจริง** (จาก `pipe/Pipe_06.csv`):
```
2026-06-03 12:30:00,2026-06-03 12:30:01,KKC-UFM/Project 02/Water Pipe/06/GET/data,
0,0,0,140.6999969,0,0.0,0,0,Unknown,0,0,0,12.72399998,210.5,1,1,1,0,0,
39.57365036,43.73752594,11,15,"{...raw json...}"
```

## 6. ข้อสังเกตเชิงคุณภาพข้อมูล (Data Quality)

- ทุกโฟลเดอร์มีไฟล์ `<name>.csv.corrupt_YYYYMMDD_HHMMSS` จำนวนหนึ่ง แสดงว่ากระบวนการรับข้อมูล MQTT → CSV เคยเขียนไฟล์เสียหาย/ผิดรูปแบบเป็นระยะ (ต้อง handle กรณีไฟล์ปัจจุบันเสียหายระหว่างอ่านด้วย)
- ไฟล์บางไฟล์ไม่ได้อัปเดตล่าสุด (เช่น `Lake_06.csv` หยุดที่ 2026-05-14, `telemetry_MKO_MUN.csv` หยุดที่ 2026-07-28) ควรตรวจสอบสถานะอุปกรณ์ก่อนใช้เป็น real-time source
- สถานีที่ยังไม่มีเซนเซอร์ครบทุกประเภท (เช่น Water Pipe/Water Lake มีแค่ 6 สถานี ในขณะที่ Water Road มี 9 และ Rain/Telemetry มี 15) — ต้อง map ตาม code เท่านั้น ไม่ใช้เลขลำดับเดียวกันข้าม type
- ค่า sensor ที่ไม่ active มักส่งเป็น `0` (เช่น `wind_direction_name = "Unknown"` เมื่อไม่มีเซนเซอร์ลมติดตั้งจริงในสถานีนั้น) ควรอย่า treat 0 เป็นค่าจริงโดยไม่กรอง

## 7. แหล่งข้อมูลต้นทาง

- Directory listing: `http://10.101.111.123:8080/transfer_data/telemetry_mqtt_data/` (เข้าถึงได้เฉพาะในเครือข่ายภายใน/intranet)
- ไฟล์อ้างอิง topic & mapping สถานที่ติดตั้ง: `Topic และ ลำดับสถานที่ติดตั้ง.xlsx` ในไดเรกทอรีเดียวกัน
