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

cd ocf-servers/js-servers
export NODE_DEBUG=led1; node led1.js &
export NODE_DEBUG=led2; node led2.js &
export NODE_DEBUG=led3; node led3.js &
export NODE_DEBUG=led4; node led4.js &
export NODE_DEBUG=buzzer; node buzzer.js &
export NODE_DEBUG=rgb_led; node rgb_led.js &

