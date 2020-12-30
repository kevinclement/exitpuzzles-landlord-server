### ngrok allows for remote ssh

```
wget latest ngrok binary from site.  unzip and copy to /opt/ngrok/
copy ngrok.yml to /opt/ngrok/
copy ngrok.service into /etc/systemd/system/

systemctl enable ngrok.service
systemctl start ngrok.service
```

### Auto start node app
```
copy exitpuzzles.service into /etc/systemd/system/

systemctl enable exitpuzzles.service
systemctl start exitpuzzles.service
```

Afterwards, should be able to 'shutdown -r now' and see it come online with ssh and node service

### Start/Stop to run by hand
```
sudo systemctl stop exitpuzzles.service
```