from pathlib import Path

path = Path('lib/schema/schema.ts')
text = path.read_text(encoding='utf-8')
text = text.replace(".default(to_char(CURRENT_TIMESTAMP, \\'yyyymm\\'::text))", ".default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`)")
text = text.replace(".default(CURRENT_USER)", ".default(sql`CURRENT_USER`)")
path.write_text(text, encoding='utf-8')
print('patched', path)
