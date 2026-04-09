from pathlib import Path
import re
base = Path('app/api/specification')
for path in sorted(base.rglob('route.ts')):
    text = path.read_text(encoding='utf-8')
    orig = text
    changed = False

    if 'export async function POST' in text and 'parseJsonRequestBody' in text:
        if "getRequestUserId" not in text:
            text = text.replace("import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';\n",
                                "import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';\nimport { getRequestUserId } from '@/lib/api/audit';\n")
            changed = True
        text, count = re.subn(r'(const parsed = await parseJsonRequestBody\(request, [^;\n]+\);\n\s*if \(parsed\.errorResponse\) return parsed\.errorResponse;\n)',
                               r"\1  const requestUserId = getRequestUserId(request);\n",
                               text)
        if count:
            changed = True
        text, count = re.subn(r'create(\w+)\(parsed\.value\)', r'create\1({ ...parsed.value, userId: requestUserId })', text)
        if count:
            changed = True

    if 'export async function PATCH' in text and 'parseJsonRequestBody' in text:
        if 'delete updatePayload.userId' not in text:
            text, count = re.subn(r'(const parsed = await parseJsonRequestBody\(request, [^;\n]+\);\n\s*if \(parsed\.errorResponse\) return parsed\.errorResponse;\n)',
                                   r"\1  const updatePayload = { ...parsed.value } as any;\n  delete updatePayload.userId;\n",
                                   text)
            if count:
                changed = True
        text, count = re.subn(r'const updated = await update(\w+)\(id, parsed\.value\);',
                               r'const updated = await update\1(id, updatePayload);',
                               text)
        if count:
            changed = True

    if changed and text != orig:
        path.write_text(text, encoding='utf-8')
        print('patched', path)
