// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM元素
const clubsGrid = document.getElementById('clubsGrid');
const eventsList = document.getElementById('eventsList');
const membersTable = document.getElementById('membersTable').getElementsByTagName('tbody')[0];
const loadMoreBtn = document.getElementById('loadMoreClubs');
const memberSearch = document.getElementById('memberSearch');
const searchBtn = document.getElementById('searchBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeButtons = document.getElementsByClassName('close');

// 当前显示的社团数量
let displayedClubs = 4;
let allClubs = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    fetchClubs();
    fetchEvents();
    fetchMembers();
    
    // 模态框事件
    loginBtn.onclick = function() {
        loginModal.style.display = "block";
    }
    
    registerBtn.onclick = function() {
        registerModal.style.display = "block";
    }
    
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = function() {
            loginModal.style.display = "none";
            registerModal.style.display = "none";
        }
    }
    
    window.onclick = function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = "none";
        }
        if (event.target == registerModal) {
            registerModal.style.display = "none";
        }
    }
    
    // 加载更多社团
    loadMoreBtn.addEventListener('click', function() {
        displayedClubs = Math.min(displayedClubs + 2, allClubs.length);
        renderClubs();
        if (displayedClubs >= allClubs.length) {
            loadMoreBtn.style.display = "none";
        }
    });
    
    // 搜索成员
    searchBtn.addEventListener('click', searchMembers);
    memberSearch.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            searchMembers();
        }
    });
    
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        loginUser(username, password);
    });
    
    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        registerUser(username, email, password);
    });
});

// 从API获取社团数据
async function fetchClubs() {
    try {
        const response = await fetch(`${API_BASE_URL}/clubs`);
        if (!response.ok) {
            throw new Error('获取社团数据失败');
        }
        allClubs = await response.json();
        renderClubs();
    } catch (error) {
        console.error('Error:', error);
        alert('获取社团数据时出错');
    }
}

// 从API获取活动数据
async function fetchEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) {
            throw new Error('获取活动数据失败');
        }
        const events = await response.json();
        renderEvents(events);
    } catch (error) {
        console.error('Error:', error);
        alert('获取活动数据时出错');
    }
}

// 从API获取成员数据
async function fetchMembers(search = '') {
    try {
        const url = search ? `${API_BASE_URL}/members?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/members`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('获取成员数据失败');
        }
        const members = await response.json();
        renderMembers(members);
    } catch (error) {
        console.error('Error:', error);
        alert('获取成员数据时出错');
    }
}

// 用户登录
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
            throw new Error('登录失败');
        }
        
        const data = await response.json();
        alert(`欢迎回来，${data.user.username}`);
        loginModal.style.display = "none";
        // 可以在这里保存用户登录状态
    } catch (error) {
        console.error('Error:', error);
        alert('登录失败，请检查用户名和密码');
    }
}

// 用户注册
async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        
        if (!response.ok) {
            throw new Error('注册失败');
        }
        
        const data = await response.json();
        alert(`注册成功，欢迎 ${data.username}`);
        registerModal.style.display = "none";
    } catch (error) {
        console.error('Error:', error);
        alert('注册失败，用户名或邮箱可能已被使用');
    }
}

// 渲染社团卡片
function renderClubs() {
    clubsGrid.innerHTML = '';
    const clubsToShow = allClubs.slice(0, displayedClubs);
    
    clubsToShow.forEach(club => {
        const clubCard = document.createElement('div');
        clubCard.className = 'club-card';
        clubCard.innerHTML = `
            <div class="club-image" style="background-image: url('${club.image_url || 'https://via.placeholder.com/300x180'}')"></div>
            <div class="club-info">
                <h3>${club.name}</h3>
                <p>${club.description || '暂无描述'}</p>
                <div class="club-meta">
                    <span><i class="fas fa-users"></i> ${club.members_count} 成员</span>
                    <span><i class="fas fa-calendar-alt"></i> ${club.events_count} 活动</span>
                </div>
            </div>
        `;
        clubsGrid.appendChild(clubCard);
    });
    
    loadMoreBtn.style.display = displayedClubs >= allClubs.length ? 'none' : 'block';
}

// 渲染活动列表
function renderEvents(events) {
    eventsList.innerHTML = '';
    
    events.forEach(event => {
        const eventDate = new Date(event.event_date);
        const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.innerHTML = `
            <div class="event-date">
                <span class="day">${eventDate.getDate()}</span>
                <span class="month">${monthNames[eventDate.getMonth()]}</span>
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <div class="event-meta">
                    <span><i class="far fa-clock"></i> ${event.event_time}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    <span><i class="fas fa-users"></i> ${event.club_id}</span>
                </div>
                <p>${event.description || '暂无描述'}</p>
            </div>
        `;
        eventsList.appendChild(eventItem);
    });
}

// 渲染成员表格
function renderMembers(members) {
    membersTable.innerHTML = '';
    
    members.forEach(member => {
        const row = membersTable.insertRow();
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.student_id}</td>
            <td>${member.club}</td>
            <td>${member.position}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${member.id}"><i class="fas fa-edit"></i> 编辑</button>
                <button class="action-btn delete-btn" data-id="${member.id}"><i class="fas fa-trash-alt"></i> 删除</button>
            </td>
        `;
        
        // 添加编辑和删除按钮事件
        row.querySelector('.edit-btn').addEventListener('click', () => editMember(member.id));
        row.querySelector('.delete-btn').addEventListener('click', () => deleteMember(member.id));
    });
}

// 搜索成员
function searchMembers() {
    const searchTerm = memberSearch.value.trim();
    fetchMembers(searchTerm);
}

// 编辑成员
async function editMember(id) {
    const member = await fetchMemberById(id);
    if (member) {
        const newName = prompt('请输入新姓名:', member.name);
        if (newName === null) return;
        
        const newStudentId = prompt('请输入新学号:', member.student_id);
        if (newStudentId === null) return;
        
        const newClub = prompt('请输入新社团:', member.club);
        if (newClub === null) return;
        
        const newPosition = prompt('请输入新职位:', member.position);
        if (newPosition === null) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/members/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newName,
                    student_id: newStudentId,
                    club: newClub,
                    position: newPosition
                }),
            });
            
            if (!response.ok) {
                throw new Error('更新成员失败');
            }
            
            alert('成员信息已更新');
            fetchMembers();
        } catch (error) {
            console.error('Error:', error);
            alert('更新成员信息时出错');
        }
    }
}

// 获取单个成员
async function fetchMemberById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/members`);
        if (!response.ok) {
            throw new Error('获取成员数据失败');
        }
        const members = await response.json();
        return members.find(m => m.id == id);
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// 删除成员
async function deleteMember(id) {
    if (confirm('确定要删除这个成员吗？')) {
        try {
            const response = await fetch(`${API_BASE_URL}/members/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('删除成员失败');
            }
            
            alert('成员已删除');
            fetchMembers();
        } catch (error) {
            console.error('Error:', error);
            alert('删除成员时出错');
        }
    }
}