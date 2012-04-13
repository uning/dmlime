<table>

<tr><td>
<a href='?mod=help' target=_blank> 帮助页面 </a>
</td><td>
<a href='?mod=support&action=view&uid=<?php echo $u ;?>' target=_blank> 数据编辑页面 </a>
</td> 
</tr>
<tr><td>
uid:<?php echo $u;?>
</td><td>
pid:<?php echo $pid;?>
cid:<?php echo $cid;?>
</td> 
</tr>

<tr><td>
loader位置
</td><td>
<?php echo LOADER_URL;?>
</td> 
</tr>
<tr><td>
配置路径
</td><td>
<?php echo LOADER_CONFIG;?>
</td> 
</tr>
<tr><td>
api位置
</td><td>
<?php echo LOADER_API;?>
</td> 
</tr>

<tr><td>
静态文件地址
</td><td>
<?php echo STATIC_URLP;?>
</td> 
</tr>
<tr><td>
公用静态文件地址
</td><td>
<?php echo COMMON_STATIC_URLP;?>
</td> 
</tr>

</table>

