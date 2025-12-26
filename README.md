# Dear Nexon Devs / Community Managers / Game Masters and Decision Makers,  

We’ve open sourced this project’s code base so you can review the functionality of the project, and hopefully publicly approve the scope and methods in which this code base works. Most notably that this application is a read-only parser. We do not modify, manipulate, emulate, or in any other way touch data that interfaces with Mabinogi’s operations.
The code you are interested in is inside the “Parser.cs” Class.

The developers of this project, some of which wish to remain anonymous, are passionate players of Mabinogi. We have created this application to enhance the player experience in Mabinogi and bring it in line with many modern MMO RPGs in functionality. We feel that this also aligns with the developers’ and director’s intentions in Mabinogi as well; streamlining and consistently enhancing the player experience. In our closed beta testing, every player that interacted with the application was ecstatic about the insight the application created.

From our perspective, this application only benefits Mabinogi. We would be greatly appreciative if whomever is responsible for putting the “Stamp of Approval" on this project at Nexon would do so.

저희는 저희가 개발한 코드베이스의 작동범위와 방식에 대한 넥슨의 공식적인 승인을 요청하고자 이 편지를 보냅니다.\
프로젝트의 기능을 검토하실 수 있도록 이 프로젝트의 코드베이스를 오픈소스로 공개하였습니다.\
특히 이 애플리케이션이 읽기 전용 파서이며, 마비노기의 운영과 관련된 데이터를 수정, 조작, 에뮬레이션하거나 그 어떠한 방식의 시도도 하지 않는다는 것을 고려해 주시기 바랍니다.\
검토하실 코드는 "Parser.cs" 클래스 안에 있습니다.\
본 프로젝트의 개발자들은 익명을 희망하는 사람도 있지만, 모두 마비노기의 열정적인 플레이어들입니다. 저희는 마비노기의 플레이어 경험을 향상시키며 많은 MMO RPG의 기능 수준에 맞도록 이 애플리케이션을 제작했습니다.\
이것이 플레이어 경험을 간소화하고 지속적으로 향상시키고자 하는 마비노기 개발팀과 디렉터의 의도와도 일치한다고 믿고 있습니다. 비공개 베타 테스트에서 이 애플리케이션을 사용한 모든 플레이어들이 이것이 제공하는 정보에 대해 매우 만족해했습니다.\
저희는 이 애플리케이션이 마비노기에 좋은 영향을 가져올 것이라고 확신하고 있습니다. 아무쪼록 넥슨의 책임자께서 승인해 주시기를 간곡하게 요청드립니다.

# Dear Potential User,
Until Nexon publishes an approval of use for this application we recommend using a managed switch or router to port mirror the game data onto a second offline computer that runs this application. Additional firewall / filtering steps should be taken to confirm there is no possible way for the secondary computer to send data outside of the local network. Please read through the FAQ and below that is get getting started on setting up a mikrotik Hex which is a cheap router that can be used to achieve this functionality.

# Mabinogi Damage Tracker
This application tracks the damage and healing done by parties for live and offline analysis. Most useful for end game raids where every burst of damage counts!
![example](Media/example.gif)


# FAQ
## Can this get me banned?
We do not know. The KR playerbase uses a similar application (written in Golang) using an identical router/managed switch port mirror setup. They have not had any notable issues using their application to our knowledge. Potentially we may set up a petition or other group effort where players can signal their support for the application.  

At one point in time an application “Nao Parse” which used “Morrighan” was used by Mabi players, this application did cause players to get banned. Our perspective is this application was too invasive because it was essentially a man in the middle attack that allowed for a lot of vulnerabilities to be potentially exploited. Regardless of those vulnerabilities never being exploited it is understandable that Nexon would not want that in circulation.  

On the other end our application has no capability of spoofing or exploiting any vulnerability. We simply read data and present the data that you would normally see on your screen on a webpage over time. There are other chat bots that read guild chat and post those messages into discord channels that have not to our knowledge caused any problems for players running those applications which work in an identical manner to our own.   

## Is this accurate?
Yes! (no), kind of? Good enough.

This application is only going to record information that you would normally see on your screen. So if you are standing too far away from a boss where you do not see the damage render in on your screen you will not track that information. Redoubled offensive and Stardust skills are also not recorded and that is a feature we would like to implement but have had difficulty doing so.

## Do i need to use the managed switch/router and a second computer.
No, you absolutely can run this all locally. But that would mean Nexon would have the capability to detect you are running the software. The implications of that being unknown at this moment.

## Does this work in other regions? Im in KR/JP/CN/… and would like to use it.
We don't know, please reach out in the discussions/bug report area of this Github repo and we can assist in getting it working. It is possible that out of the box it ‘just works’

## Is this safe?
Its open source software so you can build and compile it yourself and check the hash of the server binary. Its also written in .net so you can see what operations are being ran with .net decompilers.

## I do want to build it myself, how do it?
The project is written and maintained in VS22, NuGet manages dependencies. You will also need to have PCAP (wireshark) and node.js installed.

# Ok I read everything and understand, help me get started!
## Great! First you will have to install the prerequisite drivers, software, etc:
PCAP
	This is a kernel level driver used for reading packets. You can install Npcap directly or you can install software like Wireshark that will handle all of the driver installations.  
	https://npcap.com/  
	https://www.wireshark.org/  
Dot Net:  
	You will need Dot net 8.0 you can install the SDK or individual runtimes if desired. 
	https://dotnet.microsoft.com/en-us/download/dotnet/8.0

## Mikrotik Setup:

We recommend a Mikrotik Hex router as it is a cheap entry level router with 1 gig connections. You can use other brands if you are familiar with networking the main feature we will be using is “Port Mirroring”

These directions will be a bit open ended to allow for variation in software packages or setup. You can always google or contribute better installation instructions as well.  
Setup Steps:  
* Factory reset your router  
* Log in and clear all configurations  
* Re-login and select switch  
* Add all interfaces to the switch  
* In the newly created switch double click and open the properties. Select “Mirror” and select the port in which your computer that will play the game as the mirrored port and select the computer that will run the software as the recipient port  
* Add a firewall rule on the recipient port allowing forwarding on the local ip range  
* Add a firewall rule blocking outgoing on any ip outside of the local range  
* Complete
  
Here is a video that shows how to setup a mikrotik as a switch https://www.youtube.com/watch?v=XKYmgtVs9kc  

You can now check your recipient/tracker PC and you should see no internet connection. You should be able to ping your host PC and reach it.

## Run the server

Download the compiled server from the releases page and move that onto a local directory on your pc. Run the MabinogiDamageTracker.server.exe and you should be up and running. If a console (command prompt) does not show up or something opens and closes really quicky use the command prompt to run the application and see what error you receive.  
EX:  
cd C:/MabinogiDamageTracker  
MabinogiDamageTracker.Server.exe  
-> you should get the error message.

Open localhost:5004 in a web browser on the tracker PC and you should see the web page load after a slight wait. You can also open the webpage on the host PC with the local ip of the tracker PC port 5004.\
ex: 192.168.10.55:5004\
The app is fully functional at this point in time.

We monitor healing, general chat, and damage. Check the live page for a live log that you can determine if your getting data. If you see an error logged in the live page saying no adapter could be connected make sure you start the app with Mabinogi open and in the world with a character. You can manually set the correct adapter in the settings menu so next time the software is opened the scanning process can be skipped. If you open the server while Mabinogi is open the software will scan the ports and save it automatically. 


## We are an open source project and appreciate any contributions to the project!
Currently the main missing feature set is redoubled offensive and star dust information not being read. We are also actively developing the user experience and adding front end features. Check back with the repo occasionally and see if any new updates are out.



# Recognitions:

[KilloPillers](https://github.com/KilloPillers) - Lead front end designer, data presentation and user experience, backend integration and overall major project lead.  
Anonymous Devs - All around assistance.  
[LukasTD](https://github.com/LukasTD/NaoParse  ) - NaoParse – foundation for beginning this project with great resources.  
[Exectails](https://github.com/exectails ) - Morrighan & MabiPale2 – which was the foundation for NaoParse.  
[Pril](https://gitlab.com/prilus/mabidilmeter  ) - dilmatulgi – The Korean version of NaoParse with additional information on parsing packets.  
*The following projects were used as reference to set up chat message parsing*  
[Riskdoe](https://github.com/riskdoe  ) - mabi_guild_chat_sniffer  
[Pandurx](https://github.com/pandurx) - Discord-Mabinogi-Bot  
[Shanefully-done](https://github.com/shanefully-done  ) - Mabicord-AIO  

Min Kyunghun - Executive Director of Mabinogi – For the brilliant work bringing Mabinogi into the modern era with fresh and fun gameplay and leading the Mabinogi Eternity project.  

Finally, the Nexon Mabinogi Team – for their hard work and dedication to a decades old game.  
From Dev to CM to GM to Accountant and Office intern. We appreciate all of the work everyone puts into our favorite game.  
