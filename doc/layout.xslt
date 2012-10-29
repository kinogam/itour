<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/document">
        <html>
            <head></head>
            <title>
                <xsl:value-of select="title"/>
            </title>
            <style type="text/css">
                body
                {
                font-size:14px;
                background: #333;
                padding:0 10px;
                }
                h1
                {
                border-bottom: 1px solid #bbb;
                }
                .desc
                {
                padding: 5px 5px 10px 5px;
                background-color: #fff;
                margin: 20px 0;
                }
                .stitle
                {
                background-color: #0D5995;
                color: #fff;
                padding: 6px 20px;
                }
                .around{
                border-radius: 6px;
                }
                .tround
                {
                border-radius: 6px 6px 0 0;
                }
                .bround
                {
                border-radius: 0 0 6px 6px;
                }
                .sbody
                {
                background-color: #fff;
                padding-bottom: 5px;
                }
                .sdesc{
                color:#666;
                }
                .sdesc,.apidesc
                {
                padding: 10px;
                }
                .section
                {
                margin-bottom: 20px;
                }
                .code
                {
                background-color: #eee;
                margin: 0 30px;
                padding: 10px;
                border: 1px solid #666;
                }

                .attr
                {
                height: 23px;
                padding-top:5px;
                background: #eee;
                padding-left: 20px;
                }
                .attr span,.attr b
                {
                float: left;
                margin-right: 50px;
                }
                .api
                {
                margin-bottom: 15px;
                }
            </style>
            <link rel="stylesheet" href="highlight.css"/>
            <script src="highlight.js"></script>
            <script>
                hljs.tabReplace = '    ';
                hljs.initHighlightingOnLoad();
            </script>
            <body>
                <div  class="desc around">
                    <h1>
                        <xsl:value-of select="title"/>
                    </h1>
                    <div>
                        <xsl:value-of select="desc"/>
                    </div>
                </div>


                <xsl:for-each select="section">
                    <div class="section">
                        <div class="stitle tround">
                            <xsl:value-of select="title"/>
                        </div>
                        <div class="sbody bround">
                            <xsl:if test="desc">
                                <div class="sdesc">
                                    <xsl:value-of select="desc"/>
                                </div>
                            </xsl:if>
                            
                            <xsl:for-each select="api">

                                <div class="api">
                                    <xsl:if test="name">
                                        <div class="attr">
                                            <b>
                                                <xsl:value-of select="name"/>
                                            </b>
                                            <xsl:if test="type">
                                                <span>
                                                    类型:
                                                </span>
                                                <b>
                                                    <xsl:value-of select="type"/>
                                                </b>
                                            </xsl:if>
                                            <xsl:if test="returns">
                                                <span>
                                                    返回类型:
                                                </span>
                                                <b>
                                                    <xsl:value-of select="returns/type"/>
                                                </b>
                                                
                                                <span>
                                                    返回值说明:
                                                    <xsl:value-of select="returns/desc"/>
                                                </span>
                                            </xsl:if>
                                        </div>
                                    </xsl:if>
                                    <div class="apidesc">
                                        <xsl:value-of select="desc"/>
                                    </div>
                                    <xsl:if test="code">
                                        <pre class="code">
                                            <code class="javascript">
                                                <xsl:value-of select="code"/>
                                            </code>
                                        </pre>
                                    </xsl:if>

                                </div>

                            </xsl:for-each>
                        </div>
                    </div>
                </xsl:for-each>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
