@echo start
path %path%  
start davinci -Xmx256m -Djava.ext.dirs=%JAVA_HOME%\jre\lib\ext:..\lib edp.davinci.DavinciStarter 
pause