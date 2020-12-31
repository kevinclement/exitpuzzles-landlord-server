### Auto start node app
```
copy exitpuzzles.landlord.service into /etc/systemd/system/

systemctl enable exitpuzzles.landlord.service
systemctl start exitpuzzles.landlord.service
```

Afterwards, should be able to 'shutdown -r now' and see it come online with ssh and node service

### Start/Stop to run by hand
```
sudo systemctl stop exitpuzzles.landlord.service
```