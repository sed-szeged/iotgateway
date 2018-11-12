FROM ubuntu

#fix invoke-rc.d: policy-rc.d denied execution of start. sed -i "s/^exit 101$/exit 0/" /usr/sbin/policy-rc.d

#RUN apt-get update && \
#	DEBIAN_FRONTEND=noninteractive apt-get install -qq 
#		libc-ares-dev \
#		libcurl4-openssl-dev \
#		libmysqlclient-dev && \
#	mkdir -p /mosquitto/config /mosquitto/data /mosquitto/log && \
#	cp /etc/mosquitto/mosquitto.conf /mosquitto/config && \
#	chown -R mosquitto:mosquitto /mosquitto

RUN apt-get update && \
	DEBIAN_FRONTEND=noninteractive apt-get install -qq \
		git \
		build-essential \
		libc-ares-dev \
		uuid-dev \
		libssl-dev \
		openssl \
		libssl-dev \
		libcurl4-openssl-dev \
		apt-utils \
		pkg-config
		
RUN mkdir mauthp

#mosquitto from source
WORKDIR /mauthp
RUN git clone https://github.com/eclipse/mosquitto.git
WORKDIR /mauthp/mosquitto
COPY mosquitto/config.mk /mauthp/mosquitto
RUN make mosquitto
RUN make install

#mongo dependencies
# >=1.4.0 (ubuntu xenial package is just 1.3.1)
RUN mkdir /mauthp/mongodriver
WORKDIR /mauthp/mongodriver
RUN DEBIAN_FRONTEND=noninteractive apt-get install -qq cmake libssl-dev libsasl2-dev wget
RUN wget https://github.com/mongodb/mongo-c-driver/releases/download/1.10.0/mongo-c-driver-1.10.0.tar.gz  && \
	tar xzf mongo-c-driver-1.10.0.tar.gz  && \
	cd mongo-c-driver-1.10.0  && \
	mkdir cmake-build  && \
	cd cmake-build  && \
	cmake -DENABLE_AUTOMATIC_INIT_AND_CLEANUP=OFF .. && \
	make  && \
	make install && \
	ldconfig

#mosquitto-auth-plug
WORKDIR /mauthp
RUN git clone https://github.com/jpmens/mosquitto-auth-plug.git
WORKDIR /mauthp/mosquitto-auth-plug
COPY mosquitto-auth-plug/config.mk /mauthp/mosquitto-auth-plug
RUN make clean
RUN make

COPY mosquitto/mosquitto.conf /mauthp/mosquitto/config/mosquitto.conf
COPY docker-entrypoint.sh /

EXPOSE 1883
EXPOSE 9001

ENTRYPOINT ["/docker-entrypoint.sh"]
#CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]

CMD ["/usr/local/sbin/mosquitto", "-c", "/mauthp/mosquitto/config/mosquitto.conf"]
