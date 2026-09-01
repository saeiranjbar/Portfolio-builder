import json, os, glob

temp = os.environ.get('TEMP', os.environ.get('TMP', '.'))
files = {
    'import': os.path.join(temp, 'emtech_import.json'),
    'function': os.path.join(temp, 'emtech_function.json'),
    'Exception': os.path.join(temp, 'emtech_exception.json'),
    'patch': os.path.join(temp, 'emtech_patch.json'),
    'dumpstate': os.path.join(temp, 'emtech_dumpstate.json'),
    'adb': os.path.join(temp, 'emtech_adb.json'),
    'logcat': os.path.join(temp, 'emtech_logcat.json'),
    'NullPointerException': os.path.join(temp, 'emtech_npe.json'),
    'commit': os.path.join(temp, 'emtech_commit.json'),
    'public class': os.path.join(temp, 'emtech_publicclass.json'),
    'git': os.path.join(temp, 'emtech_git.json'),
    'diff': os.path.join(temp, 'emtech_diff.json'),
    'stacktrace': os.path.join(temp, 'emtech_stacktrace.json'),
}

all_tickets = {}  # key -> {summary, categories: set}

for category, filepath in files.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for issue in data.get('issues', []):
            key = issue.get('key', '')
            summary = issue.get('summary', '')
            if key not in all_tickets:
                all_tickets[key] = {'summary': summary, 'categories': set()}
            all_tickets[key]['categories'].add(category)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

# Sort by ticket number
sorted_keys = sorted(all_tickets.keys(), key=lambda k: int(k.split('-')[1]))

# Write to file
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'emtech_closed_code_tickets.txt')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write("=" * 80 + "\n")
    f.write("EMMTECH Closed Tickets Containing Code Snippets\n")
    f.write(f"Total unique tickets: {len(sorted_keys)}\n")
    f.write(f"Generated from Jira sdsdev site (devops.sdsdev.co.kr)\n")
    f.write("=" * 80 + "\n\n")
    
    f.write("Search categories used:\n")
    f.write("  import, function, Exception, patch, dumpstate, adb, logcat,\n")
    f.write("  NullPointerException, commit, public class, git, diff, stacktrace\n\n")
    
    f.write("-" * 80 + "\n")
    f.write(f"{'Ticket Key':<20} {'Categories':<50} Summary\n")
    f.write("-" * 80 + "\n")
    
    for key in sorted_keys:
        ticket = all_tickets[key]
        cats = ', '.join(sorted(ticket['categories']))
        f.write(f"{key:<20} {cats:<50} {ticket['summary']}\n")
    
    f.write("\n" + "=" * 80 + "\n")
    f.write(f"Total: {len(sorted_keys)} unique closed tickets with code-related content\n")
    f.write("=" * 80 + "\n")

print(f"Written {len(sorted_keys)} tickets to {output_path}")
