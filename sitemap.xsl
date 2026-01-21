<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap - screaminspace.com</title>
        <style>
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;color:#0b1220}
          h1{margin:0 0 12px}
          p{margin:0 0 20px;color:#445}
          table{border-collapse:collapse;width:100%;max-width:1100px}
          th,td{border-bottom:1px solid #e7e7ee;padding:10px 8px;text-align:left;vertical-align:top}
          th{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#667}
          a{color:#0a67ff;text-decoration:none}
          a:hover{text-decoration:underline}
          code{background:#f6f7fb;padding:2px 6px;border-radius:6px}
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p>
          This is the human-readable view of <code>/sitemap.xml</code>.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td><xsl:value-of select="sitemap:lastmod"/></td>
                <td>
                  <xsl:for-each select="image:image">
                    <div>
                      <a href="{image:loc}"><xsl:value-of select="image:loc"/></a>
                    </div>
                  </xsl:for-each>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

