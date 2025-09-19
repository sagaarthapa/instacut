from modules.photo_restoration import PhotoRestorationEngine

engine = PhotoRestorationEngine()
print('=== Photo Restoration Engine Status ===')
status = engine.get_status()
for key, value in status.items():
    print(f'{key}: {value}')

print('\n=== Available Methods ===')
methods = engine.get_available_restoration_methods()
for method in methods:
    print(f'- {method["id"]}: {method["name"]}')
    print(f'  Description: {method["description"]}')
    print(f'  Category: {method["category"]}')
    print()