import sys, time, os
import cms

files = cms.get_files_path('content/', 'md')
cache = {}
for file in files:
    cache[file] = 0

while True:
    try:
        time.sleep(1)
        files = cms.get_files_path('content/', 'md')
        for file in files:
            stamp = os.stat(file).st_mtime
            if file not in files:
                cache[file] = 0
            if stamp != cache[file]:
                cache[file] = stamp
                cms.make()
                print('updated: '+file+' at ' + str(stamp) + ' \n')

    except KeyboardInterrupt:
        print('\nDone')
        break
    except:
        print(f'Unhandled error: { sys.exc_info()[0] }')
        break