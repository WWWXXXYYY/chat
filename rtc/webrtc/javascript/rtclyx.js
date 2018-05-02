var videochatroom=document.getElementById('videochatroom');
var users=$('#users');
var usersmap={};
var usersmapsize=0;
$("#loginbutton").click(
  function(){
    $("#loginpage").hide();
    $("#videochatroom").show();
    $("#sendinput")[0].focus();
    creatlocalvideocontainer();
    $('#users').val($('#username')[0].value);
    var remotes=document.createElement('div');
    remotes.setAttribute('id','remotes');
    videochatroom.appendChild(remotes);
    //在链接中提取地址
    var room = location.search && location.search.split('?')[1];
    //var room =$("#roomname")[0].value;
    //创建webrtc连接
    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localvideo',
       // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
       //请求音视频接入
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });
    //加入链接中的房间
    webrtc.on('readyToCall', function () {
        //房间名称任意	
        if (room) 	webrtc.joinRoom(room);
        webrtc.adduserslist();
    });

    webrtc.on('channelMessage', function (peer, label, data) {
               if (data.type == 'chat') {
               $('#messages').val($('#messages')[0].value+data.payload+'\n');  
               $('#messages').scrollTop($("#messages")[0].scrollHeight);             
               }
           });
    
    webrtc.on('videoAdded', function (video, peer) {
               console.log('video added', peer);             
               if (remotes) {
               
			        webrtc.webrtc.sendToAll('nickname',$('#username')[0].value);                    
                    var d = document.createElement('div');
                    d.className = 'videocontainer';
                    usersmapsize++;
                    //¶¨Î»´ÓÉÏÍùÏÂÓÅÏÈ
                    //var top=(usermapsize%2)*210+38;
                    //var left=Math.floor((usermapsize)/2)*250+15;
                    //´Ó×óµ½ÓÒÓÅÏÈ
					
                    var top=Math.floor(usersmapsize/3)*210+38;
                    var left=(usersmapsize)%3*250+15;
                    var position='top:'+top.toString()+'px;left:'+left.toString()+'px';
                    d.setAttribute('style',position);
                    
                    d.id = 'container_' + webrtc.getDomId(peer);  
                
                    video.style.width='100%';
                    video.style.height='100%';
                    var videotitle=document.createElement('div');
                    videotitle.id='videotitle_'+peer.id;
                    videotitle.setAttribute('class','videotitle');
                    d.appendChild(videotitlebutton1);
                    d.appendChild(videotitlebutton2);
                    d.appendChild(videotitlebutton3);
                    d.appendChild(videotitle);
                    d.appendChild(video);
                    remotes.appendChild(d);
                    webrtc.updateuserslist();                    
                }
            });
      webrtc.on('videoRemoved', function (video, peer) {
            console.log('video removed ', peer);
            var remotes = document.getElementById('remotes');
            var el = document.getElementById('container_' + webrtc.getDomId(peer));
            if (remotes && el) {
                remotes.removeChild(el);                
                webrtc.updateuserslist(); 
               }
            });

        // Since we use this twice we put it here
        function setRoom(name) {
            $('#messages').val('Link to join: ' + location.href+'\n');
            $('body').addClass('active');
        }

        if (room) {
           setRoom(room);
            } else {
                    var val = $('#roomname').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
                    webrtc.createRoom(val, function (err, name) {
                        console.log(' create room cb', arguments);
                    
                        var newUrl = location.pathname + '?' + name;
                        if (!err) {
                            history.replaceState({foo: 'bar'}, null, newUrl);
                            setRoom(name);
                        } else {
						    if (err === 'taken'){
							  alert('Room Name have been taken.Need another Room Name.')
							}
                            console.log(err);
                        }
                      });       
                    }

            
			$("#sendinput").keyup(
			function(){
			if (event.keyCode==13){
			var message=$("#sendinput")[0].value;
			message=$("#messages")[0].value+$('#username')[0].value+" :"+message+"\n";					
			webrtc.sendchat('simplewebrtc','chat',$('#username')[0].value+" :"+$("#sendinput")[0].value);
			$("#messages").val(message);
			$('#messages').scrollTop($("#messages")[0].scrollHeight);
			$("#sendinput").val("");
			} 
			})
			
			webrtc.on('onlinelist',function(payload){
			    var userlist="";
			    for (var i in payload){
			    	userlist=userlist+i+'\n';
			    		};
			    $('#users').val(userlist);
			 });
			 window.onbeforeunload = function(){
			 webrtc.removeuserslist();	 
			 }
			 setInterval(function(){
			                for (var i in usersmap){
			                        var title=document.getElementById('videotitle_'+i);
			                        if (title) title.innerHTML=usersmap[i];
                                };
                        },2000);
			    
  }
)


function creatlocalvideocontainer(){
    
    var localvideocontainer=document.createElement('div');
    localvideocontainer.setAttribute('class','videocontainer');
    localvideocontainer.setAttribute('id','localvideocontainer');
    var localvideotitle=document.createElement('div');
    localvideotitle.setAttribute('class','videotitle');
    var username=$("#username")[0].value;
    localvideotitle.innerHTML=username;
    var localvideotitlebutton1=document.createElement('input');    
    localvideotitlebutton1.setAttribute('type','image');
    localvideotitlebutton1.setAttribute('src','minus.png');  
    localvideotitlebutton1.setAttribute('class','videotitlebutton');
    localvideotitlebutton1.setAttribute('style','right:20%');
    localvideotitlebutton1.value='-';
    localvideotitlebutton1.onclick=function small(){
        localvideocontainer.setAttribute('style','height:200px;width:240px');
    }
    var localvideotitlebutton2=document.createElement('input');
    localvideotitlebutton2.setAttribute('type','image');
    localvideotitlebutton2.setAttribute('src','recover.png');
    localvideotitlebutton2.setAttribute('class','videotitlebutton');
    localvideotitlebutton2.setAttribute('style','right:10%');
    localvideotitlebutton2.value='+';
    localvideotitlebutton2.onclick=function big(){
    localvideocontainer.setAttribute('style','height:440px;width:520px');
    }
    var localvideotitlebutton3=document.createElement('input');
    localvideotitlebutton3.setAttribute('type','image');
    localvideotitlebutton3.setAttribute('src','plus.png');
    localvideotitlebutton3.setAttribute('class','videotitlebutton');
    localvideotitlebutton3.setAttribute('style','right:0');
    localvideotitlebutton3.value='X';
    localvideotitlebutton3.onclick=function close(){
    localvideocontainer.setAttribute('style','height:640px;width:800px');
    }
    var localvideo=document.createElement('video');
    localvideo.setAttribute('id','localvideo');
    localvideo.setAttribute('class','video');
    localvideo.setAttribute('autoplay','autoplay');
    localvideotitle.appendChild(localvideotitlebutton1);
    localvideotitle.appendChild(localvideotitlebutton2);
    localvideotitle.appendChild(localvideotitlebutton3);
    localvideocontainer.appendChild(localvideotitle);
    localvideocontainer.appendChild(localvideo);
    videochatroom.appendChild(localvideocontainer);
    }
