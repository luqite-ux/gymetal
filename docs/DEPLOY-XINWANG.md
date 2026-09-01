# 新网 Windows 服务器部署说明

## 覆盖与启动

1. 停止当前网站 Node.js 服务。
2. 备份 `D:\www\gymetaltech` 后，将源码部署包解压并覆盖到该目录。
3. 保留服务器现有的环境变量与密钥配置，不要用部署包覆盖 `.env*`。
4. 在部署目录执行 `npm ci` 和 `npm run build`。部署包不包含任何密钥，也不包含本机 `node_modules`。
5. 确认进程使用 Node.js 24，工作目录为 `D:\www\gymetaltech`，启动命令为 `npm start`，并设置：
   - `HOSTNAME=127.0.0.1`
   - `PORT=3000`
6. 重启 Node.js 服务，并先在服务器本机访问 `http://127.0.0.1:3000`。

## Caddy 免费 HTTPS

无需购买新网付费 SSL。Caddy 可自动向公开 CA 申请和续期证书。Caddyfile 应包含：

```caddyfile
gymetaltech.com, www.gymetaltech.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

应用前执行：

```powershell
& "C:\Program Files\caddy\caddy.exe" validate --config "C:\Program Files\caddy\Caddyfile"
Restart-Service caddy
Get-Service caddy
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 80,443,3000 }
```

前置条件：`gymetaltech.com` 的 A 记录指向 `165.154.22.8`，`www` 指向主域名或同一 IP，且新网安全组和 Windows 防火墙均放行 TCP 80、443。Caddy 服务账号还需能访问互联网的 80/443 端口。

## 部署后验证

- `http://gymetaltech.com` 自动跳转到 HTTPS。
- `https://gymetaltech.com` 和 `https://www.gymetaltech.com` 均可访问且证书有效。
- `/es`、`/pt`、`/fr`、`/ar`、`/el`、`/ru`、`/de` 均返回 200；阿拉伯语页面为 RTL。
- 前端语言菜单可以切换九种语言，切换后站内链接保留当前语言。
- 产品、新闻、FAQ、设备和联系页显示目标语言；错误验证码不写入询盘，正确验证码可提交。
- `/sitemap.xml` 包含九语 URL 与 `hreflang`。

若 Caddy 未签发证书，先检查 DNS 是否已全球生效、80/443 是否可从公网访问，再查看 Caddy 服务日志；不要购买证书作为首选处理方式。
