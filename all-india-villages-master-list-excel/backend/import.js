const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(__dirname, '..', 'final_village_dataset.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').slice(1).filter(l => l.trim());
  console.log('Total rows:', lines.length);

  const country = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: { code: 'IN', name: 'India' }
  });
  console.log('Country created');

  const stateMap = {}, districtMap = {}, subMap = {};
  let villages = [], done = 0, skipped = 0;

  for (const line of lines) {
    const cols = line.split(',');
    if (cols.length < 8) { skipped++; continue; }
    const [sc, sn, dc, dn, subc, subn, vc, vn] = cols.map(c => c.replace(/\r/g,'').trim());
    if (!sn || !dn || !vn || sn === 'state_name') { skipped++; continue; }

    const stateKey = sc + '|' + sn;
    if (!stateMap[stateKey]) {
      const s = await prisma.state.upsert({
        where: { countryId_code: { countryId: country.id, code: sc || sn } },
        update: {},
        create: { code: sc || sn, name: sn, countryId: country.id }
      });
      stateMap[stateKey] = s.id;
    }

    const distKey = stateKey + '|' + dc + '|' + dn;
    if (!districtMap[distKey]) {
      const d = await prisma.district.upsert({
        where: { stateId_code: { stateId: stateMap[stateKey], code: dc || dn } },
        update: {},
        create: { code: dc || dn, name: dn, stateId: stateMap[stateKey] }
      });
      districtMap[distKey] = d.id;
    }

    const subKey = distKey + '|' + subc + '|' + subn;
    if (!subMap[subKey]) {
      const sub = await prisma.subDistrict.upsert({
        where: { districtId_code: { districtId: districtMap[distKey], code: subc || subn || 'NA' } },
        update: {},
        create: { code: subc || subn || 'NA', name: subn || 'NA', districtId: districtMap[distKey] }
      });
      subMap[subKey] = sub.id;
    }

    villages.push({ code: vc || 'NA', name: vn, subDistrictId: subMap[subKey] });

    if (villages.length === 500) {
      await prisma.village.createMany({ data: villages, skipDuplicates: true });
      done += villages.length;
      villages = [];
      process.stdout.write('\rImported: ' + done);
    }
  }

  if (villages.length > 0) {
    await prisma.village.createMany({ data: villages, skipDuplicates: true });
    done += villages.length;
  }

  console.log('\nDone! Villages imported:', done, '| Skipped:', skipped);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
