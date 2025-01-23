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
数据库导入<strong>database/初始化数据库.sql</strong>完成初始化<br> 
数据库导入<strong>database/初始化用户信息.sql</strong>完成用户初始化<br>
初始化后用户信息如下：管理员：admin: password123，普通用户：user: 123456<br>
<strong>可选</strong>导入测试数据来测试，或自行测试。<br>
<br>
<strong>过期提醒：</strong><br>
理论上只要安装好依赖即可运行，但是若使用linux服务器可能需要创建虚拟环境，请自行百度。<br>
如需要定时发送，请自行百度，Linux可以用面板自带的定时任务或Crontab, Windows请用任务计划程序。
  

<h1>更新日志</h1>
<strong>2025-1-14</strong><br>
1. 第一次提交代码<br>
<strong>2025-1-23</strong><br>
1. 修复了部分bug，优化了部分代码，优化外观显示<br>
2. 添加了用户管理功能，管理员可以修改其他用户密码、删除和创建用户<br>
3. 添加了添加、编辑和删除药品的限制，必须登陆才可以使用<br>
4. 支持扫码录入信息<br>
