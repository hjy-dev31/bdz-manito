// UTF-8 CSV. Quoted fields may contain commas, newlines and doubled quotes.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i+1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && c === ',') {
      row.push(field);
      field = '';
    } else if (!quoted && (c === '\n' || c === '\r')) {
      if (c === '\r' && text[i+1] === '\n') i++;
      rows.push([...row,field]);
      row = [];
      field = '';
    } else field += c;
  }
  if (quoted) throw new Error('Invalid CSV');
  if (field || row.length) rows.push([...row,field]);
  return rows;
}
export default {
  async fetch(request, env) {
    const headers = {'Access-Control-Allow-Origin':env.SITE_ORIGIN, 'Cache-Control':'no-store'};
    if (request.method !== 'POST') return new Response(null,{status:405,headers});
    const fields = new URLSearchParams(await request.text());
    const values = ['number','name','password'].map(key=>fields.get(key));
    const [header,...rows] = parseCsv(env.PARTICIPANTS_CSV);
    const columns = ['번호','이름','비밀번호'].map(key=>header?.indexOf(key) ?? -1);
    if (columns.includes(-1)) return new Response(null,{status:503,headers});
    const participant = values.every(Boolean) && rows.find(row=>columns.every((col,i)=>row[col]===values[i]));
    if (!participant) return Response.json({admitted:false},{status:401,headers});
    const mission = participant[header.indexOf('미션')]?.trim();
    const targetNumber = participant[header.indexOf('대상번호')];
    const targetRow = targetNumber && rows.find(row=>row[columns[0]]===targetNumber);
    const target = targetRow && targetRow !== participant ? targetRow[columns[1]] : null;
    return Response.json({admitted:true,mission:mission || null,target},{headers});
  }
};
