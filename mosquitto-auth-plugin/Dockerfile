FROM ubuntu

ENV MOSQUITTO_VERSION 1.5.3
ENV MOSQUITTO_AUTH_VERSION 0.1.3
ENV MONGO_DRIVER_VERSION 1.10.0

RUN apt-get update && \
	DEBIAN_FRONTEND=noninteractive apt-get install -qq \
                apt-utils \
		pkg-config \
		git \
		build-essential \
		libc-ares-dev \
		uuid-dev \
		libssl-dev \
		openssl \
		libssl-dev \
		libcurl4-openssl-dev \
		wget

RUN mkdir mauthp

#mosquitto from source
WORKDIR /mauthp
RUN wget http://mosquitto.org/files/source/mosquitto-$MOSQUITTO_VERSION.tar.gz && tar -xvzf mosquitto-$MOSQUITTO_VERSION.tar.gz && mv mosquitto-$MOSQUITTO_VERSION mosquitto
WORKDIR /mauthp/mosquitto
COPY mosquitto/config.mk /mauthp/mosquitto
RUN make mosquitto
#RUN make binary
RUN make install		
	

#mongo dependencies
# >=1.4.0 (ubuntu xenial package is just 1.3.1)
RUN mkdir /mauthp/mongodriver
WORKDIR /mauthp/mongodriver
RUN DEBIAN_FRONTEND=noninteractive apt-get install -qq cmake libssl-dev libsasl2-dev wget
RUN wget https://github.com/mongodb/mongo-c-driver/releases/download/$MONGO_DRIVER_VERSION/mongo-c-driver-$MONGO_DRIVER_VERSION.tar.gz  && \
	tar xzf mongo-c-driver-$MONGO_DRIVER_VERSION.tar.gz  && \
	cd mongo-c-driver-$MONGO_DRIVER_VERSION  && \
	mkdir cmake-build  && \
	cd cmake-build  && \
	cmake -DENABLE_AUTOMATIC_INIT_AND_CLEANUP=OFF .. && \
	make  && \
	make install && \
	ldconfig


#mosquitto-auth-plug
WORKDIR /mauthp
#RUN git clone https://github.com/jpmens/mosquitto-auth-plug.git
RUN wget https://github.com/jpmens/mosquitto-auth-plug/archive/$MOSQUITTO_AUTH_VERSION.tar.gz && tar -xvzf $MOSQUITTO_AUTH_VERSION.tar.gz && mv mosquitto-auth-plug-$MOSQUITTO_AUTH_VERSION mosquitto-auth-plug
WORKDIR /mauthp/mosquitto-auth-plug
COPY mosquitto-auth-plug/config.mk /mauthp/mosquitto-auth-plug
RUN make clean
RUN make

COPY mosquitto/mosquitto.conf /mauthp/mosquitto/config/mosquitto.conf
COPY auth_file.pw /mauthp/mosquitto/auth_file.pw
COPY docker-entrypoint.sh /


EXPOSE 1883
EXPOSE 9001

ENTRYPOINT ["/docker-entrypoint.sh"]
#CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]

CMD ["/usr/local/sbin/mosquitto", "-c", "/mauthp/mosquitto/config/mosquitto.conf"]
