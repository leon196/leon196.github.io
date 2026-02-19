import sys, time, os
import cms

files = cms.get_files_path('content/', 'yml')
cache = {}
for file in files:
    cache[file] = os.stat(file).st_mtime

while True:
    # try:
    #     time.sleep(1)
    #     files = cms.get_files_path('content/', 'yml')
    #     changed = False;
    #     for file in files:
    #         stamp = os.stat(file).st_mtime
    #         if file in cache == False or stamp != cache[file]:
    #             cache[file] = stamp
    #             changed = True
    #             # print('updated: '+file+' at ' + str(stamp) + ' \n')
    #     if changed:    
    #         cms.make()

    # except KeyboardInterrupt:
    #     print('\nDone')
    #     break
    # except:
    #     print(f'Unhandled error: { sys.exc_info()[0] }')
    #     break

    time.sleep(1)
    new_files = cms.get_files_path('content/', 'yml')
    if len(new_files) != len(files):
        for file in files:
            cache[file] = os.stat(file).st_mtime
        cms.make()
    files = new_files
    for file in files:
        stamp = os.stat(file).st_mtime
        if stamp != cache[file]:
            cache[file] = stamp
            cms.make()
            
            # print('updated: '+file+' at ' + str(stamp) + ' \n')
        