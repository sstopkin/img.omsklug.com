#
# Omsklug img
#

FROM node:4.5
MAINTAINER Sergey Stopkin <stopkin.sergey@gmail.com>

#Let people know how this was built
ADD Dockerfile /root/Dockerfile

WORKDIR /data

COPY build /data/

CMD /bin/bash /data/run.sh start
