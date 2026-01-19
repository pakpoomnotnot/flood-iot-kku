import { floodSituation, rainStations, evacuationZones, drainagePlan, emergencyContacts } from './map_help'

export const generateOfficialPDFReport = async (): Promise<void> => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    
    const d = new Date();
    const dateStr = d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    
    // ข้อมูลบึง (ตัวอย่าง - ใส่ไม่มีข้อมูลไปก่อน)
    const swampData = [
      { name: 'บึงหนองโคตร', capacity: 0, current: 0, percent: 0, status: 'ไม่มีข้อมูล' },
      { name: 'บึงแก่นนคร', capacity: 0, current: 0, percent: 0, status: 'ไม่มีข้อมูล' },
      { name: 'บึงทุ่งสร้าง', capacity: 0, current: 0, percent: 0, status: 'ไม่มีข้อมูล' }
    ];

    // ข้อมูลท่อระบายน้ำ (ตัวอย่าง - ใส่ไม่มีข้อมูลไปก่อน)
    const drainageMonitoring = [
      { location: 'ประตูระบายน้ำที่ 5 (ในท่อก่อนเข้า ปตร.5)', subdistrict: 'ต.ในเมือง', district: 'อ.เมือง', basin: 'ลุ่มน้ำชี', level: 0, maxLevel: 0, risk: '-', remaining: 0, time: '-', status: 'ไม่มีข้อมูล' },
      { location: 'ถนนหมอชาญอุทิศ', subdistrict: 'ต.ในเมือง', district: 'อ.เมือง', basin: 'ลุ่มน้ำชี', level: 0, maxLevel: 0, risk: '-', remaining: 0, time: '-', status: 'ไม่มีข้อมูล' },
      { location: 'ศูนย์วิจัยและเพาะเลี้ยงสัตว์น้ำจืด', subdistrict: 'ต.บ้านค้อ', district: 'อ.เมือง', basin: 'ลุ่มน้ำชี', level: 0, maxLevel: 0, risk: '-', remaining: 0, time: '-', status: 'ไม่มีข้อมูล' }
    ];

    // ข้อมูลน้ำท่วมบนผิวถนน (ตัวอย่าง - ใส่ไม่มีข้อมูลไปก่อน)
    const roadFloodMonitoring = [
      { location: 'ถนนศรีจันทร์', subdistrict: 'ต.ในเมือง', district: 'อ.เมือง', basin: 'ลุ่มน้ำชี', level: 0, threshold: 0, status: '-', remaining: 0, time: '-', dataStatus: 'ไม่มีข้อมูล' },
      { location: 'ถนนมิตรภาพ', subdistrict: 'ต.ในเมือง', district: 'อ.เมือง', basin: 'ลุ่มน้ำชี', level: 0, threshold: 0, status: '-', remaining: 0, time: '-', dataStatus: 'ไม่มีข้อมูล' },
      { location: 'ถนนหน้ามหาวิทยาลัย', subdistrict: 'ต.ในเมือง', district: 'อ.เมือง', basin: 'ลุ่มน้ำชี', level: 0, threshold: 0, status: '-', remaining: 0, time: '-', dataStatus: 'ไม่มีข้อมูล' }
    ];
    
    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 794px;
      padding: 45px 35px;
      background: white;
      font-family: 'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
      color: #000;
      font-size: 12px;
      line-height: 1.4;
    `;
    
    el.innerHTML = `
      <div style="margin-bottom: 20px;">
  <!-- Row: Logos + Title -->
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
    "
  >
    <!-- Logos (small) -->
    <div style="display: flex; gap: 6px;">
      <img src="/uni.png" style="height: 48px;" />
      <img src="/w_ch.png" style="height: 44px;" />
      <img src="/tsri.svg" style="height: 44px;" />
      <img src="/kku.png" style="height: 48px;" />
    </div>

    <!-- Divider -->
    <div style="width: 1px; height: 16px; background: #666;"></div>

    <!-- Title -->
    <div style="text-align: left;">
      <div style="font-size: 18px; font-weight: bold; line-height: 1.2;">
        รายงานการเฝ้าระวังติดตามสถานการณ์น้ำและความช่วยเหลือ
      </div>
      <div style="font-size: 14px; font-weight: bold;">
        ศูนย์ปฏิบัติการทรัพยากรธรรมชาติและสิ่งแวดล้อม (ด้านทรัพยากรน้ำ)
      </div>
    </div>
  </div>

  <!-- Sub text -->
  <div style="text-align: center;">
    <div style="font-size: 12px; margin-bottom: 2px;">
      เทศบาลนครขอนแก่น
    </div>
    <div style="font-size: 11px; margin-bottom: 2px;">
      กองวิเคราะห์และประเมินสถานการณ์น้ำ กรมทรัพยากรน้ำ
    </div>
    <div style="font-size: 10px; color: #333;">
      โทรศัพท์ 0 2271 6000 ต่อ 6445 โทรสาร 0 2298 6629 www.xxxx.go.th
    </div>
  </div>
</div>
      
      <!-- Report Info Bar -->
      <div style="background: #f0f0f0; border: 1px solid #333; padding: 8px 12px; margin-bottom: 18px;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 11px; font-weight: bold;">รายงานฉบับที่ ${floodSituation.announcementNo}</td>
            <td style="font-size: 11px; font-weight: bold; text-align: right;">เวลา ${timeStr} น. วันที่ ${dateStr}</td>
          </tr>
        </table>
      </div>

      <!-- Recipients Line -->
      <div style="font-size: 11px; margin-bottom: 15px; font-weight: bold;">
        เรียน ผู้บริหารและหน่วยงานที่เกี่ยวข้อง
      </div>

      <!-- Section 1: บทสรุปสถานการณ์ -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          1. บทสรุปสถานการณ์น้ำ
        </div>
        <div style="font-size: 11px; padding: 0 10px; text-align: justify; line-height: 1.7;">
          <p style="margin: 6px 0; text-indent: 40px;">
            สถานการณ์น้ำในพื้นที่จังหวัดขอนแก่น ณ วันที่ ${dateStr} เวลา ${timeStr} น. 
            ${floodSituation.mainMessage} ${floodSituation.detail}
          </p>
          <p style="margin: 6px 0; text-indent: 40px;">
            จากการติดตามสถานการณ์อย่างใกล้ชิด พบว่าระดับน้ำในบึงและแหล่งน้ำสาธารณะต่างๆ 
            อยู่ในเกณฑ์ปกติ ระบบระบายน้ำสามารถรองรับได้ตามปกติ อย่างไรก็ตาม 
            ขอให้ประชาชนในพื้นที่เสี่ยงเฝ้าระวังและติดตามข่าวสารอย่างต่อเนื่อง 
            โดยเฉพาะในช่วงที่มีการพยากรณ์ฝนตกหนัก
          </p>
          <p style="margin: 6px 0; text-indent: 40px;">
            ทั้งนี้ หน่วยงานที่เกี่ยวข้องได้เตรียมพร้อมรับสถานการณ์ มีการเฝ้าระวังและตรวจสอบ
            ระบบระบายน้ำทุกจุดอย่างสม่ำเสมอ พร้อมทั้งมีแผนการดำเนินงานเพื่อบรรเทาผลกระทบ
            ในกรณีที่สถานการณ์มีความรุนแรง
          </p>
        </div>
      </div>

      <!-- Section 2: สภาวะอากาศและพยากรณ์ -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          2. ระดับปริมาณน้ำฝน
        </div>
        
        <div style="font-size: 11px; padding: 0 10px; margin-bottom: 10px;">
          <strong>สภาพอากาศปัจจุบัน (${timeStr} น.)</strong>
          <p style="margin: 4px 0 4px 20px; line-height: 1.6;">
            ${floodSituation.mainMessage} ${floodSituation.detail}
            ขอให้ประชาชนดูแลรักษาสุขภาพเนื่องจากสภาพอากาศที่เปลี่ยนแปลง 
            และเพิ่มความระมัดระวังในการสัญจรผ่านบริเวณที่มีหมอก
          </p>
        </div>

        <div style="font-size: 11px; padding: 0 10px; margin-bottom: 10px;">
          <strong>ระดับปริมาณน้ำฝนคาดการณ์ 24 ชั่วโมงข้างหน้า</strong>
          <p style="margin: 4px 0 4px 20px; line-height: 1.6; color: #666;">
            <em>ไม่มีข้อมูล</em>
          </p>
        </div>

        <div style="font-size: 11px; padding: 0 10px;">
          <strong>ระดับปริมาณน้ำฝนคาดการณ์ 72 ชั่วโมงข้างหน้า</strong>
          <p style="margin: 4px 0 4px 20px; line-height: 1.6; color: #666;">
            <em>ไม่มีข้อมูล</em>
          </p>
        </div>
      </div>

      <!-- Section 3: ปริมาณฝนสะสม -->
      <div style="margin-bottom: 40px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          3. ปริมาณฝนสะสม 24 ชั่วโมง (07:00 น. เมื่อวาน - 07:00 น. วันนี้)
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 10px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 70px;">รหัสสถานี</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: left; font-weight: bold;">ชื่อสถานี</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 70px;">ละติจูด</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 70px;">ลองจิจูด</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 80px;">ฝน 24 ชม.<br/>(มม.)</th>
              <th style="border: 1px solid #666; padding: 6px; text-align: center; font-weight: bold; width: 80px;">ฝน 72 ชม.<br/>(มม.)</th>
            </tr>
          </thead>
          <tbody>
            ${rainStations.slice(0, 15).map((station, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #f5f5f5;' : ''}">
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${station.stationCode}</td>
                <td style="border: 1px solid #999; padding: 5px;">${station.nameTh}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${station.lat.toFixed(3)}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">${station.long.toFixed(3)}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; font-weight: bold;">${station.past24h || '-'}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; font-weight: bold; color: #666;">ไม่พบข้อมูล</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 4: สถานการณ์น้ำในบึง -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          4. สถานการณ์น้ำในบึงและแหล่งเก็บกักน้ำ
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 10px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 5px; text-align: left; font-weight: bold;">ชื่อบึง</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">ความจุ<br/>(ล้าน ลบ.ม.)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">ปริมาตรน้ำ<br/>(ล้าน ลบ.ม.)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">เปอร์เซ็นต์<br/>(%)</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${swampData.map((swamp, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #f5f5f5;' : ''}">
                <td style="border: 1px solid #999; padding: 5px;">${swamp.name}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; color: #999;">${swamp.capacity || '-'}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; color: #999;">${swamp.current || '-'}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; color: #999;">${swamp.percent || '-'}</td>
                <td style="border: 1px solid #999; padding: 5px; text-align: center; color: #999; font-style: italic;">${swamp.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 5: ระบบตรวจวัดระดับน้ำในท่อระบายน้ำ -->
      <div style="margin-bottom: 18px; page-break-inside: avoid;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          5. ระบบตรวจวัดระดับน้ำในท่อระบายน้ำ
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 9px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 4px; text-align: left; font-weight: bold; width: 150px;">จุดตรวจวัด</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ตำบล</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">อำเภอ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ลุ่มน้ำ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 50px;">ระดับน้ำ<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 50px;">ระดับ<br/>สูงสุด<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ระดับ<br/>ความเสี่ยง</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 50px;">เหลือ<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 80px;">เวลา<br/>ตรวจวัด</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold;">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${drainageMonitoring.map((item, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #f5f5f5;' : ''}">
                <td style="border: 1px solid #999; padding: 4px; font-size: 8px;">${item.location}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.subdistrict}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.district}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.basin}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.level || '-'}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.maxLevel || '-'}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.risk}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.remaining || '-'}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.time}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999; font-style: italic;">${item.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 6: ระบบตรวจวัดน้ำท่วมบนผิวถนน -->
      <div style="margin-bottom: 18px; page-break-inside: avoid;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          6. ระบบตรวจวัดน้ำท่วมบนผิวถนน
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 9px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 4px; text-align: left; font-weight: bold; width: 140px;">จุดตรวจวัด</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ตำบล</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">อำเภอ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 60px;">ลุ่มน้ำ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 55px;">ระดับน้ำ<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 55px;">เกณฑ์<br/>เตือน<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 70px;">สถานะ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 50px;">เหลือ<br/>(ม.)</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold; width: 80px;">เวลา<br/>ตรวจวัด</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold;">ข้อมูล</th>
            </tr>
          </thead>
          <tbody>
            ${roadFloodMonitoring.map((item, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #f5f5f5;' : ''}">
                <td style="border: 1px solid #999; padding: 4px;">${item.location}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.subdistrict}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.district}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.basin}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.level || '-'}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.threshold || '-'}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.status}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.remaining || '-'}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999;">${item.time}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center; color: #999; font-style: italic;">${item.dataStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 7: การเตือนภัย -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          7. การเตือนภัย Early Warning
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 11px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 5px; text-align: center; font-weight: bold;">ระดับเตือน</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: left; font-weight: bold;">โซน/พื้นที่</th>
              <th style="border: 1px solid #666; padding: 5px; text-align: left; font-weight: bold;">คำแนะนำ</th>
            </tr>
          </thead>
          <tbody>
            ${evacuationZones.map((zone, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #f5f5f5;' : ''}">
                <td style="border: 1px solid #999; padding: 5px; text-align: center;">
                  ${zone.riskLevel === 'CRITICAL' ? 'เตือนสีแดง' : 
                    zone.riskLevel === 'WARNING' ? 'เตือนสีเหลือง' : 
                    'เตือนสีเขียว'}
                </td>
                <td style="border: 1px solid #999; padding: 5px;">${zone.zoneName}</td>
                <td style="border: 1px solid #999; padding: 5px;">${zone.action} - ยกของสูง ${zone.itemHeight}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 8: การดำเนินงานระบายน้ำ -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; background: #e8e8e8; padding: 6px 10px; border-left: 4px solid #333;">
          8. การดำเนินงานระบายน้ำ
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 0 10px; font-size: 10px;">
          <thead>
            <tr style="background: #d0d0d0;">
              <th style="border: 1px solid #666; padding: 4px; text-align: left; font-weight: bold;">สถานที่</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold;">การดำเนินการ</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: left; font-weight: bold;">เป้าหมาย</th>
              <th style="border: 1px solid #666; padding: 4px; text-align: center; font-weight: bold;">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${drainagePlan.map((item, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #f5f5f5;' : ''}">
                <td style="border: 1px solid #999; padding: 4px;">${item.location}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.action}</td>
                <td style="border: 1px solid #999; padding: 4px;">${item.target}</td>
                <td style="border: 1px solid #999; padding: 4px; text-align: center;">${item.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

     

      <!-- Closing -->
      <div style="margin-top: 54px; font-size: 11px; text-align: center;">
        <p style="margin: 5px 0;">จึงเรียนมาเพื่อโปรดทราบ</p>
        <div style="margin-top: 40px;">
          <p style="margin: 3px 0; font-weight: bold;">นายXXXX XXXXX</p>
          <p style="margin: 3px 0;">อธิบดีกรมทรัพยากรน้ำ</p>
          <p style="margin: 3px 0;">ประธานคณะทำงานศูนย์ปฏิบัติการ</p>
          <p style="margin: 3px 0;">ทรัพยากรธรรมชาติและสิ่งแวดล้อม (ด้านทรัพยากรน้ำ)</p>
        </div>
      </div>
    `;

    document.body.appendChild(el);
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(el);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `รายงานประจำวัน_${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง");
  }
};
