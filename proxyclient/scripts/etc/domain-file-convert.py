import sys

#open file
with open(sys.argv[1], "r") as f:
    lines = f.readlines()

    #write new file
    with open(sys.argv[1][:-4] + "-list.txt", "w") as new:
        for line in lines:
            data = line.split()
            new.write(data[1] + '\n')
