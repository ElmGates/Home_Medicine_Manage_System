# Home_Medicine_Manage_System
Home Medicine Manage System, a system witch can help you to manage the medicines you have. ---家庭药品管理系统，一个可以帮助您管理药品的系统。


<h1>安装需求：</h1>    
<strong>网站：</strong><br>
<strong>Nginx+PHP+Mysql/mariaDB</strong> <br> 
建议PHP版本7.4以上，以下也可以，我没有测试。<br> 
PHP需要有<strong>PDO和Curl以及mysqli</strong>的拓展！<br> 
<br>
<strong>过期提醒：</strong><br>
Python环境，安装必要的拓展：<strong>requests/pymysql</strong><br> 


<h1>部署流程：</h1>    
<strong>网站：</strong><br>
下载源码，将web中的所有源码放到网站根目录（网站自行创建，不会的用 [宝塔](https://www.bt.cn/) 或 [1Panel](https://1panel.cn/) ，再不会请百度）<br> 
修改根目录的<strong>config.json</strong>配置你的mysql地址和登录信息<br> 
数据库导入<strong>database/sql-import.sql</strong>完成初始化<br> 
<strong>可选</strong>导入测试数据来测试，或自行测试。<br>
<br>
<strong>过期提醒：</strong><br>
理论上只要安装好依赖即可运行，但是若使用linux服务器可能需要创建虚拟环境，请自行百度。<br>
如需要定时发送，请自行百度，Linux可以用面板自带的定时任务或Crontab, Windows请用任务计划程序。
