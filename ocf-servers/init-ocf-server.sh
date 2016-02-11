#sleep 120
iptab_output=`iptables -S`
echo $iptab_output |grep -v "8000" |grep -v "5683"
if [[ $? -eq 0 ]];then
  echo Enable port 5683 and  8000
  /usr/sbin/iptables -A INPUT -p udp --dport 5683 -j ACCEPT
  /usr/sbin/iptables -A INPUT -p udp --dport 5684 -j ACCEPT
  /usr/sbin/iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
else
  echo 'Port 5693 and 8000 are enabled'
fi

echo ps |grep iot-rest-api-server |grep restful
if [[ $? -ne 0 ]];then
  echo  Launch iot-rest-api-server...
  systemctl start iot-rest-api-server
else
  echo Rest API Server was launched
fi

currentPath=$(cd `dirname $0`; pwd)
runJs() {
  ps | grep $1.js | grep -v grep
  if [[ $? -ne 0 ]];then
    export NODE_DEBUG=$1; node $currentPath/$1.js &
  fi
}

runJs rgb_led1
runJs rgb_led2
runJs rgb_led3
runJs rgb_led4
runJs buzzer
runJs rgb_led5
