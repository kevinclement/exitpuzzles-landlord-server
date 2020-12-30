# VSCode extension 'Remote VSCode' is installed

# SSH is configured locally with server
```
# .ssh/config
Host pi
    HostName tcp.ngrok.io
    Port 10383
    User pi
    ForwardAgent yes
    RemoteForward 52698 127.0.0.1:52698
```

# Connect with stream
```$ ssh -R 52698:127.0.0.1:52698 -v pi ```

# Open files
```$ rcode index.js```