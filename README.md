> All rights reserved to the original authors of Palmyra, *Javed et al. (2018)* and *Taji and Habash (2020)*.

This is a fork of the Palmyra project, the goal of this fork is to embed it into the quran project so we can complete the annotation of the quranic text/data. The original read me can be found in the [README.txt](README.txt) file.


## Development

### Pulling from the original repo
This repository was originally a fork of the Palmyra project, but has since been detached so we can make the repository private. But sinsce it *was a fork* we can set the upstream to the original repo and pull in the changes.

**First add the original repo as an upstream remote:**
```bash
git remote add upstream https://github.com/CAMeL-Lab/palmyra.git
```
To verify that the upstream remote has been added, you can run:
```bash
git remote -v
```

**Then pull in the changes:**
```bash
git fetch upstream
git checkout main
git merge upstream/main
# or
git rebase upstream/main
```

**Push the changes to the private repo:**
```bash
git push origin main
```
