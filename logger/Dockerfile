FROM python:3

RUN pip3 install paho-mqtt pymongo

ADD logger.py /

CMD [ "python", "-u", "logger.py" ]



