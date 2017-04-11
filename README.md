# RealSense OCF Demos
These samples illustrate how to develop applications using Intel® RealSense™ JavaScript [API](https://01org.github.io/node-realsense/doc/spec) and Open Connectivity Foundation™ ([OCF](https://openconnectivity.org)) JavaScript [API](https://github.com/01org/iot-js-api/tree/master/ocf).

## Get Start

### HardWare

- PC with wi-fi module built in  
- [Intel® Joule™ Module](https://software.intel.com/en-us/iot/hardware/joule) * 2
- [Intel® RealSense™ Camera ZR300](https://newsroom.intel.com/chip-shots/intel-announces-tools-realsense-technology-development/)
- [Grove LED Socket kit](http://www.seeedstudio.com/wiki/Grove_-_LED) * 4
- [Grove Chainable RGB LED](http://www.seeedstudio.com/depot/twig-chainable-rgb-led-p-850.html?cPath=156_157)

### Setup Environment on PC
1. Make sure Ubuntu 16.04 installed on your PC.
2. Create a wireless LAN via [`create_ap`](https://github.com/oblique/create_ap) tool
    - Install this tool
       ```
       # git clone https://github.com/oblique/create_ap
       # cd create_ap
       # make install
       ```
   - Lunch it and create a LAN
       ```
       # sudo create_ap wlp1s0 wlp1s0 MyAccessPoint
       ```

### Setup RealSense Execution Environment on Joule

Please refer to this [tutorial](https://github.com/01org/node-realsense/blob/master/doc/setup_environment.md) for details introduction.

### Setup OCF Server Test Environment on another Joule
1. Please follow this [instruction](https://github.com/intel/intel-iot-refkit/blob/master/doc/howtos/image-install.rst) to install
[iot-ref-kit image](http://iot-ref-kit.ostc.intel.com/download/builds/intel-iot-refkit_master/).

2. There are some dependencies(uuid-dev, libcure4-openssl-dev and a C++ compiler (gcc-5 or later) etc.) need to install at first, you can install them via command:

    ```
    # sudo apt-get install uuid-dev libcurl4-openssl-dev libboost-all-dev sqlite3 glib2.0-dev
    ```
    
3. Install [`iotivity-node`](https://github.com/otcshare/iotivity-node) via command `npm install iotivity-node`, for detail information
please refer to [here](https://github.com/otcshare/iotivity-node/blob/master/README.md).
4. [`iot-rest-api-server`](https://github.com/01org/iot-rest-api-server/) also is necessary, install method is same as `iotivity-node`,
run command `npm install iot-rest-api-server`. After install the server, enter the Joule device and using below command to launch this server:

    ```
    # systemctl start iot-rest-api-server
    ```
    
    Meanwhile, you need to enable port `8000` maunally:
    ```
    # iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
    ```

    Note that when using the [IoT Reference OS Kit](https://github.com/intel/intel-iot-refki), its firewall will block the IoTivity network traffic by default. A brute-force approach is to disable the firewall altogether as follows:
    ```
    # systemctl disable iptables
    # systemctl disable ip6tables
    ```
    A better solution would be to open up just the ports that are required. Port 5683 is used by the CoAP protocol during the device discovery phase, 5684 is used for secured traffic (*note:* this will be used when IoTivity turns on the `SECURED` compile-time flag) and other (random) ports are used later to communicate with the device. If you wish to open up just the required ports, you can do so as follows:
    ```
    # iptables -A INPUT -p udp --dport 5683 -j ACCEPT
    # iptables -A INPUT -p udp --dport 5684 -j ACCEPT
    ```
    To open ports for the IPv6 traffic, do:
    ```
    # ip6tables -A INPUT -s fe80::/10 -p udp -m udp --dport 5683 -j ACCEPT
    # ip6tables -A INPUT -s fe80::/10 -p udp -m udp --dport 5684 -j ACCEPT
    ```
    A range of ports can also be specified as follows:
    ```
    # iptables -A INPUT -p udp --dport <start>:<end> -j ACCEPT
    # ip6tables -A INPUT -s fe80::/10 -p udp -m udp --dport <start>:<end> -j ACCEPT
    ```
5. Enter to the Joule device and connect to WIFI "MyAccessPoint"
    ```
    root@iot-ref-kit#: connmanctl
      connmanctl> enable wifi
          Enabled wifi
      connmanctl> scan wifi
          Scan completed for wifi
      connmanctl> services
          AO Wired  ethernet_000000000000_cable
          MyAccessPoint wifi_dc85de828967_38303944616e69656c74_managed_psk
          [...]
      connmanctl> agent on
	        Agent registered
      connmanctl> connect wifi_dc85de828967_38303944616e69656c74_managed_psk
      connmanctl> quit
    root@iot-ref-kit#: ip a
      1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue
          link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
          inet 127.0.0.1/8 scope host lo
          inet6 ::1/128 scope host
             valid_lft forever preferred_lft forever
      2: enp0s20f6: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast qlen 1000
          link/ether 00:13:20:ff:14:43 brd ff:ff:ff:ff:ff:ff
          inet 169.254.5.1/16 brd 169.254.255.255 scope link enp0s20f6:avahi
          inet6 fe80::213:20ff:feff:1443/64 scope link
             valid_lft forever preferred_lft forever
      3: wlp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq qlen 1000
          link/ether aa:bb:cc:dd:ee:ff brd ff:ff:ff:ff:ff:ff
          inet 192.168.0.2/24 brd 192.168.0.255 scope global wlp1s0
          inet6 fe80::ed2:92ff:fe6d:f1d2/64 scope link
             valid_lft forever preferred_lft forever
    ```
    This Joule must have one ip is same domain as the first Joule which setup realsense environment.

