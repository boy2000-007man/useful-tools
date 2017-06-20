$(function(){
    // 全局设定

    $.support.cors = true;

    var newsopts = {
        gameExtensionId: '45',  // 新闻ID
        pageSize: '5',  // 每页列表数量
        positionId: '2',  //
        saveAjax: {}
    };

    // 路由

    Q.reg('news', function(typeid, pageid, detailid){
        $('#mainly').removeClass('mainly-alt');
        $('.maintype').hide();
        $('.info-main-core').hide();
        $('.news-core').show();
        if(!!detailid){
            showDetail(typeid, pageid, detailid);
        }else{
            typeid = !typeid ? '0' : typeid;
            pageid = !pageid ? '1' : pageid;
            showList(typeid, pageid);
        }
    });

    Q.init({
        key: '!',
        index: 'news'
    });

    // 函数

    function showList(typeid, pageid){
        $('.news-core-list').show();
        $('[data-news="' + typeid + '"]').addClass('active').siblings('li.active').removeClass('active');
        $('.news-core-detail').hide();
        ajaxList(typeid, pageid, function(data){
            var totalNum = data.totalNum;
            data = data.data;
            if(data && data.length > 0){
                $('.news-core-list-text ul').html('加载中...');
                var html = '';
                for(var i = 0, len = data.length; i < len; i++){
                    var time = data[i].createTime.replace(/^(\d+)\-(\d+)\-(\d+)\s+[\d:]+$/, function(t, y, m, d){
                        return y + '-' + m + '-' + d;
                    });
                    var type = data[i].typeId == '1' && '公告' || data[i].typeId == '2' && '新闻' || data[i].typeId == '3' && '评测' || data[i].typeId == '4' && '活动' || data[i].typeId == '5' && '攻略';
                    html += '<li class="clearfix"><strong>[' + type + ']</strong><a href="#!news/' + typeid + '/' + pageid + '/' + data[i].id + '">' + data[i].title + '</a><span>[' + time + ']</span></li>';
                }
                $('.news-core-list-text ul').html(html);
                showPage(typeid, pageid, totalNum);
            }else{
                $('.news-core-list-text ul').html('敬请期待！');
            }
        });
    }

    function ajaxList(typeid, pageid, callback){
        typeid = !!typeid ? typeid : '';
        typeid = typeid == '0' ? '' : typeid;
        var str = typeid + '_' + pageid + '_' + newsopts.gameExtensionId,
            savedata = newsopts.saveAjax[str];
        savedata ? callback(savedata) : crossDomainAjax('//api.biligame.com/news/list.action?gameExtensionId=' + newsopts.gameExtensionId + '&positionId=' + newsopts.positionId + '&pageNum=' + pageid + '&pageSize=' + newsopts.pageSize + '&typeId=' + typeid, function (data) {
            if(data.code == 0){
                callback && callback(data);
                newsopts.saveAjax[str] = data;
            }
        });
    }

    function showPage(typeid, pageid, totalnum){
        var pageall = Math.ceil(Number(totalnum) / Number(newsopts.pageSize)),
            pageprev = Number(pageid) - 1,
            pagenext = Number(pageid) + 1;
        var html = '';
        if(pageall <= 5){
            for (var i = 1; i <= pageall; i++){
                html += '<a class="' + (i == pageid ? 'active' : '') + '" href="#!news/' + typeid + '/' + i + '">' + i + '</a>';
            }
        }else{
            html += Number(pageid) - 2 > 1 ? '...' : '';
            for (var i = 0; i < 5; i++){
                if(Number(pageid) - 2 < 1){
                    var pnum = i + 1;
                    html += '<a class="' + (pnum == pageid ? 'active' : '') + '" href="#!news/' + typeid + '/' + pnum + '">' + pnum + '</a>';
                }else if(Number(pageid) + 2 > pageall ){
                    var pnum = pageall - 4 + i;
                    html += '<a class="' + (pnum == pageid ? 'active' : '') + '" href="#!news/' + typeid + '/' + pnum + '">' + pnum + '</a>';
                }else{
                    var pnum = pageid - 2 + i;
                    if(1 <= pnum && pnum <= pageall){
                        html += '<a class="' + (i == 2 ? 'active' : '') + '" href="#!news/' + typeid + '/' + pnum + '">' + pnum + '</a>';
                    }
                }
            }
            html += Number(pageid) + 2 < pageall ? '...' : '';
        }
        html = '<a ' + (pageprev < 1 ? 'style="display:none;"' : '') + ' href="#!news/' + typeid + '/' + pageprev + '">上一页</a>' + html + '<a ' + (pagenext > pageall ? 'style="display:none;"' : '') + ' href="#!news/' + typeid + '/' + pagenext + '">下一页</a>';
        $('.news-core-paging').html(html);
    }
    
    function showDetail(typeid, pageid, detailid){
        $('.news-core-list').hide();
        $('.news-core-detail').show();
        $('.news-core-detail-info, .news-core-detail-title').html('');
        $('.news-core-detail-content').html('加载中...');
        ajaxDetail(detailid, function(data){
            var time = data.modifyTime.replace(/^(\d+)\-(\d+)\-(\d+)\s+[\d:]+$/, function(t, y, m, d){
                return y + '-' + m + '-' + d;
            });
            $('.news-core-back').attr('href', '#!news/' + typeid + '/' + pageid);
            $('.news-core-detail-title').html(data.title);
            $('.news-core-detail-info').html('<span>时间：' + time + '</span>&nbsp;&nbsp;<span>作者：' + data.author + '</span>&nbsp;&nbsp;<span>来源：' + data.site + '</span>');
            $('.news-core-detail-content').html(data.content);
            // 判断新闻id，显示抽奖结果
            if (detailid == 1509) {
            	//抽奖结果用户名加星
				function del(msg){
					var content = msg[0];
					for (var i = 0; i < msg.length-1; i++){
						if (content.length <= 11){
							content += '*'
						}
					}
					return content;
				}
				//抽奖结果滚动
				function autoScroll(){
					setTimeout(function(){
						$('.result-list').animate({
			                'top':240-$('.result-list').height()
			            },58000,'linear')
					},1000)
				}
				//插入抽卡结果
				function showResult(data){
                    var content = '<div id="show-result">抽奖结果公示：</div><div class="lucky-result"><div class="header"><p class="p1">服务器</p><p class="p2">角色名称</p><p class="p3">奖励</p><p class="p4">稀有度</p></div><ul class="result-list"></ul></div>';
                    $('.news-core-detail-content').append(content);
                    localStorage.setItem('lucky_result',JSON.stringify(data));
                    for (var i = 0; i < data.length; i++){
                        $('.result-list').append('<li><p class="p1">'+ data[i].sname +'</p><p class="p2">'+ del(data[i].rname) +'</p><p class="p3">'+ data[i].info +'</p><p class="p4">'+ data[i].star +'</p></li>')
                    }
                    // 抽奖结果滚屏
                    autoScroll();
                }
            	crossDomainAjax('//activity.biligame.com/board/list?game_id=112&game_key=a5f36e53ab3b0c41&rows=31',function(data){
            		if(data.code != -500 && data.data.length != 0){
            			data = data.data;
						showResult(data);
            		}else if(localStorage.getItem('lucky_result')){
            			//移除展示板块
            			$('#show-result').remove();
            			$('.lucky-result').remove();
            			data = JSON.parse(localStorage.getItem('lucky_result'));
						showResult(data);
            		}else{ 
            			$('#show-result').remove();
            			$('.lucky-result').remove();
            		}
            	}).fail(function(){
                    if(localStorage.getItem('lucky_result')){
                    	$('#show-result').remove();
            			    $('.lucky-result').remove();
                        data = JSON.parse(localStorage.getItem('lucky_result'));
                        showResult(data);
                    }else{
                    	$('#show-result').remove();
            			$('.lucky-result').remove();
                    }
            	})
            	//定时更新抽奖结果
            	setInterval(function(){
            		crossDomainAjax('//activity.biligame.com/board/list?game_id=112&game_key=a5f36e53ab3b0c41&rows=31',function(data){
	            		if(data.code != -500 && data.data.length != 0){
	            			$('#show-result').remove();
            			    $('.lucky-result').remove();
	            			data = data.data;
	            			showResult(data);
	            		}else if(localStorage.getItem('lucky_result')){
	            			$('#show-result').remove();
            			    $('.lucky-result').remove();
	            			data = JSON.parse(localStorage.getItem('lucky_result'));
	            			showResult(data);
	            		}else{
	            			$('#show-result').remove();
            			    $('.lucky-result').remove();
	            		}
	            	}).fail(function(){
	            		if(localStorage.getItem('lucky_result')){
	            			$('#show-result').remove();
            			    $('.lucky-result').remove();
	                	    data = JSON.parse(localStorage.getItem('lucky_result'));
	            			showResult(data);
                        }else{
                        	$('#show-result').remove();
            			    $('.lucky-result').remove();
                        }
	            	})
				},60000)
            }
        });
    }

    function ajaxDetail(detailid, callback){
        crossDomainAjax('//api.biligame.com/news/' + detailid + '.action', function (data) {
            if(data.code == 0){
                callback && callback(data.data);
            }
        });
    }

    function crossDomainAjax(url, successCallback) {
       return  $.ajax({
            url: url,
            dataType: 'json',
            type: 'GET',
            success: successCallback,
            error: function(xhr, status, e) {
                console.log(status, e);
            }
        });
    }

    function popups(message) {
        var html = '<div class="lay-box" style="width:100%;height:100%;position:fixed;top:0;left:0;z-index:9999;background:rgba(0, 0, 0, 0.75);"><div class="lay-core" style="width:500px;min-height:200px;margin-top:-100px;margin-left:-250px;position:absolute;top:50%;left:50%;background:rgba(0, 0, 0, 0.25)"><div class="lay-core-bg" style="width:488px;height:188px;margin:6px;background-color:#fff;"><div class="lay-close" style="width:40px;height:40px;float:right;font-family:\'Microsoft Yahei\';font-size:40px;line-height:1;text-align:center;cursor:pointer;color:#333;">×</div><div class="lay-div" style="text-align:center;padding-top:70px;font-size:20px;line-height:2;color:#333;"></div></div></div></div>';
        $('body').append(html).find('.lay-div').html(message);
        $('.lay-close').click(function(){
            $('.lay-box').remove();
        });
        $('.lay-core').css('margin-top', ($('.lay-core').height() / 2 * -1 - 50));
    }

    $('.dialog-module .btn-close').click(function() {
        $(this).parents('.dialog-module').removeClass('show');
    });
    $('.td-layer').click(function() {
        $('#dialogDownload').addClass('show');
    });
});
