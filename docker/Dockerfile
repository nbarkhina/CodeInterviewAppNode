FROM node:latest

WORKDIR "/home/node"

RUN git clone https://github.com/nbarkhina/CodeInterviewAppNode

WORKDIR "/home/node/CodeInterviewAppNode"

RUN npm install

EXPOSE 5500

CMD ["npm","start"]

# TO BUILD AND RUN
# docker build -t codeinterviewapp .
# docker run -p 80:5500 -d codeinterviewapp
#    (open a browser to port 80)