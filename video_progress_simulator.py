#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
视频进度模拟脚本
用于模拟课程视频观看进度，自动发送进度更新请求
"""

import requests
import time
import json
import re
from typing import Dict, Optional, Tuple

class VideoProgressSimulator:
    """视频进度模拟器"""
    
    def __init__(self, token: str, cookie: str):
        """
        初始化模拟器
        
        Args:
            token: 认证Token (从请求头中获取)
            cookie: Cookie字符串 (包含_zte_cid_等信息)
        """
        self.base_url = "https://spoc.buaa.edu.cn/spocnewht"
        self.token = token
        self.cookie = cookie
        
        # 通用请求头
        self.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json;charset=UTF-8',
            'Cookie': self.cookie,
            'DNT': '1',
            'Origin': 'https://spoc.buaa.edu.cn',
            'Pragma': 'no-cache',
            'RoleCode': '01',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Token': self.token,
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'sec-ch-ua': '"Not_A Brand";v="99", "Chromium";v="142"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"'
        }
    
    def add_record(self, kcnrid: str, kcid: str, nrlx: str = "99") -> bool:
        """
        添加内容阅读记录
        
        Args:
            kcnrid: 课程内容ID
            kcid: 课程ID
            nrlx: 内容类型 (默认"99"表示视频)
            
        Returns:
            是否成功
        """
        url = f"{self.base_url}/kcnr/addNrydjlb"
        data = {
            "kcnrid": kcnrid,
            "kcid": kcid,
            "nrlx": nrlx
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=data, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"添加记录失败: {e}")
            return False
    
    def save_user_behavior(self, yhdm: str) -> bool:
        """
        保存学号
        
        Args:
            yhdm: 学号代码
            
        Returns:
            是否成功
        """
        url = f"{self.base_url}/zxyh/saveYh"
        params = {"yhdm": yhdm}
        
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"保存学号失败: {e}")
            return False
    
    def update_online_count(self, kcid: str) -> bool:
        """
        更新课程在线人数
        
        Args:
            kcid: 课程ID
            
        Returns:
            是否成功
        """
        url = f"{self.base_url}/kcnr/updKczxrs"
        data = {"kcid": kcid}
        
        try:
            response = requests.post(url, headers=self.headers, json=data, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"更新在线人数失败: {e}")
            return False
    
    def update_progress(self, kcnrid: str, kcid: str, bfjd: int, bfsj: float, 
                       ssmlid: str, sfyd: str = "0") -> bool:
        """
        更新视频播放进度
        
        Args:
            kcnrid: 课程内容ID
            kcid: 课程ID
            bfjd: 播放进度百分比 (0-100)
            bfsj: 播放时间(秒)
            ssmlid: 所属目录ID
            sfyd: 是否已读 ("0"未读, "1"已读)
            
        Returns:
            是否成功
        """
        url = f"{self.base_url}/kcnr/updKcnrSfydNew"
        data = {
            "bfjd": bfjd,
            "kcnrid": kcnrid,
            "kcid": kcid,
            "sfyd": sfyd,
            "bfsj": bfsj,
            "ssmlid": ssmlid
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=data, timeout=10)
            if response.status_code == 200:
                print(f"进度更新成功: {bfjd}% ({bfsj:.2f}秒)")
                return True
            else:
                print(f"进度更新失败: HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"进度更新异常: {e}")
            return False
    
    def simulate_video_watching(self, kcnrid: str, kcid: str, ssmlid: str,
                                video_duration: float, speed: float = 2.0,
                                update_interval: float = 0.4, yhdm: str = 00000000) -> bool:
        """
        模拟观看视频
        
        Args:
            kcnrid: 课程内容ID
            kcid: 课程ID
            ssmlid: 所属目录ID
            video_duration: 视频总时长(秒)
            speed: 播放速度倍数 (默认1.0)
            update_interval: 进度更新间隔(秒) (默认5秒)
            yhdm: 学号代码
            
        Returns:
            是否成功完成
        """
        print(f"\n开始模拟观看视频...")
        print(f"视频时长: {video_duration}秒")
        print(f"播放速度: {speed}x")
        print(f"更新间隔: {update_interval}秒")
        print("-" * 50)
        
        # 初始化：添加记录
        if not self.add_record(kcnrid, kcid):
            print("初始化失败")
            return False
        
        # 更新在线人数
        self.update_online_count(kcid)
        
        current_time = 0.0
        
        while current_time < video_duration:
            # 计算当前进度
            progress = int((current_time / video_duration) * 100)
            progress = min(progress, 100)
            
            # 判断是否已读完
            sfyd = "1" if progress >= 100 else "0"
            
            # 周期性保存
            self.save_user_behavior(yhdm)
            
            # 更新进度
            if not self.update_progress(kcnrid, kcid, progress, current_time, ssmlid, sfyd):
                print("进度更新失败，继续尝试...")
            
            # 如果已完成，退出
            if progress >= 100:
                print("\n视频观看完成！")
                break
            
            # 等待下一次更新
            time.sleep(update_interval)
            current_time += update_interval * speed
        
        # 确保最后发送100%进度
        if current_time >= video_duration:
            self.update_progress(kcnrid, kcid, 100, video_duration, ssmlid, "1")
        
        return True
    
    def fast_complete(self, kcnrid: str, kcid: str, ssmlid: str,
                     video_duration: float, yhdm: str) -> bool:
        """
        快速完成视频（直接标记为已看完）
        
        Args:
            kcnrid: 课程内容ID
            kcid: 课程ID
            ssmlid: 所属目录ID
            video_duration: 视频总时长(秒)
            yhdm: 学号代码
            
        Returns:
            是否成功
        """
        print(f"\n快速完成模式...")
        print(f"视频时长: {video_duration}秒")
        print("-" * 50)
        
        # 添加记录
        if not self.add_record(kcnrid, kcid):
            print("初始化失败")
            return False
        
        # 更新在线人数
        self.update_online_count(kcid)
        
        # 保存学号
        self.save_user_behavior(yhdm)
        
        # 直接标记为100%完成
        success = self.update_progress(kcnrid, kcid, 100, video_duration, ssmlid, "1")
        
        if success:
            print("\n视频已标记为完成！")
        else:
            print("\n标记失败！")
        
        return success


def parse_curl_command(curl_text: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    从 curl 命令中解析所需参数
    
    Args:
        curl_text: curl 命令文本
        
    Returns:
        (token, cookie, kcnrid, kcid, ssmlid, yhdm) 元组
    """
    token = None
    cookie = None
    kcnrid = None
    kcid = None
    ssmlid = None
    yhdm = None
    
    # 提取 Token
    token_match = re.search(r"'Token:\s*([^']+)'", curl_text)
    if token_match:
        token = token_match.group(1)
    
    # 提取 Cookie (_zte_cid_)
    cookie_match = re.search(r"-b\s+'([^']+)'", curl_text)
    if cookie_match:
        cookie = cookie_match.group(1)
    
    # 提取 data-raw 中的 JSON 数据
    data_match = re.search(r"--data-raw\s+'({[^']+})'", curl_text)
    if data_match:
        try:
            data = json.loads(data_match.group(1))
            kcnrid = data.get('kcnrid')
            kcid = data.get('kcid')
            ssmlid = data.get('ssmlid')
        except json.JSONDecodeError:
            pass
    
    # 提取 yhdm (从 URL 参数中)
    yhdm_match = re.search(r'yhdm=(\d+)', curl_text)
    if yhdm_match:
        yhdm = yhdm_match.group(1)
    
    return token, cookie, kcnrid, kcid, ssmlid, yhdm


def main():
    """主函数 - 使用示例"""
    
    print("=" * 70)
    print("视频进度模拟器")
    print("=" * 70)
    
    print("\n请粘贴从浏览器开发者工具复制的 curl 命令")
    print("(只能是 addKcnrSfydNew 请求)")
    print("粘贴完成后按两次回车:\n")
    
    # 读取多行 curl 命令
    curl_lines = []
    empty_count = 0
    while empty_count < 2:
        try:
            line = input()
            if line.strip():
                curl_lines.append(line)
                empty_count = 0
            else:
                empty_count += 1
        except EOFError:
            break
    
    curl_text = ' '.join(curl_lines)
    
    # 解析 curl 命令
    token, cookie, kcnrid, kcid, ssmlid, yhdm_from_curl = parse_curl_command(curl_text)
    
    # 检查必需参数
    if not all([token, cookie, kcnrid, kcid, ssmlid]):
        print("\n❌ 错误: 无法从 curl 命令中提取所有必需参数")
        print(f"Token: {'✓' if token else '✗'}")
        print(f"Cookie: {'✓' if cookie else '✗'}")
        print(f"KCNRID: {'✓' if kcnrid else '✗'}")
        print(f"KCID: {'✓' if kcid else '✗'}")
        print(f"SSMLID: {'✓' if ssmlid else '✗'}")
        return
    
    print("\n✓ 成功解析参数:")
    print(f"  Token: {token[:50]}...")
    print(f"  Cookie: {cookie}")
    print(f"  KCNRID: {kcnrid}")
    print(f"  KCID: {kcid}")
    print(f"  SSMLID: {ssmlid}")
    
    # 获取学号
    if yhdm_from_curl:
        print(f"  YHDM (从curl中提取): {yhdm_from_curl}")
        yhdm = yhdm_from_curl
    else:
        yhdm = input("\n请输入学号 (yhdm): ").strip()
        if not yhdm:
            print("❌ 错误: 学号不能为空")
            return
    
    # 获取视频时长
    try:
        video_duration = float(input("\n请输入视频总时长(秒): ").strip())
    except ValueError:
        print("❌ 错误: 视频时长必须是数字")
        return
    
    # 创建模拟器实例
    simulator = VideoProgressSimulator(token, cookie)
    
    # 选择模式
    print("\n请选择模式:")
    print("1. 正常模拟观看（按实际速度更新进度）")
    print("2. 快速完成（直接标记为已完成）")
    
    try:
        choice = input("\n请输入选项 (1/2): ").strip()
        
        if choice == "1":
            # 正常模拟模式
            speed = float(input("请输入播放速度倍数 (例如: 1.0, 2.0): ").strip() or "1.0")
            interval = float(input("请输入进度更新间隔(秒) (默认5): ").strip() or "5.0")
            
            simulator.simulate_video_watching(
                kcnrid=kcnrid,
                kcid=kcid,
                ssmlid=ssmlid,
                video_duration=video_duration,
                speed=speed,
                update_interval=interval,
                yhdm=yhdm
            )
        
        elif choice == "2":
            # 快速完成模式
            simulator.fast_complete(
                kcnrid=kcnrid,
                kcid=kcid,
                ssmlid=ssmlid,
                video_duration=video_duration,
                yhdm=yhdm
            )
        
        else:
            print("无效的选项！")
    
    except KeyboardInterrupt:
        print("\n\n用户中断操作")
    except Exception as e:
        print(f"\n发生错误: {e}")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()