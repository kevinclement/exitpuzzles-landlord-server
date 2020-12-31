### Auto start node app
```
sudo cp exitpuzzles.landlord.service /etc/systemd/system/

# install service
sudo systemctl enable exitpuzzles.landlord.service

# start service
sudo systemctl start exitpuzzles.landlord.service

# to check status
sudo systemctl status exitpuzzles.landlord.service

```

Afterwards, should be able to 'shutdown -r now' and see it come online with ssh and node service

### Start/Stop to run by hand
```
sudo systemctl stop exitpuzzles.landlord.service
```

### udev
#### to get udev rule info 
```sudo udevadm info /dev/ttyUSB1```

#### to restart without reboot
```sudo udevadm control --reload-rules && sudo udevadm trigger```


