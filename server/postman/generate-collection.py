#!/usr/bin/env python3
"""
Generate comprehensive Postman collection for ZthOrbit API testing
"""

import json
import uuid
from typing import List, Dict, Any

BASE_URL = "{{baseUrl}}"

def generate_uuid() -> str:
    """Generate a unique ID for Postman items"""
    return str(uuid.uuid4())

def create_test_script(tests: List[str]) -> str:
    """Create test script from list of test assertions"""
    return "\n".join(tests)

def create_request(
    name: str,
    method: str,
    url: str,
    body: Dict = None,
    headers: List[Dict] = None,
    auth_required: bool = True,
    description: str = "",
    tests: List[str] = None
) -> Dict[str, Any]:
    """Create a Postman request item"""
    
    # Default headers
    default_headers = [
        {"key": "Content-Type", "value": "application/json", "type": "text"}
    ]
    
    # Auth header if required
    if auth_required:
        default_headers.append({
            "key": "Authorization",
            "value": "Bearer {{accessToken}}",
            "type": "text"
        })
    
    if headers:
        default_headers.extend(headers)
    
    request_obj = {
        "name": name,
        "request": {
            "method": method,
            "header": default_headers,
            "url": {
                "raw": url,
                "host": ["{{baseUrl}}"],
                "path": url.replace(BASE_URL + "/", "").split("/")
            }
        },
        "response": []
    }
    
    # Add body for POST/PUT/PATCH
    if body and method in ["POST", "PUT", "PATCH"]:
        request_obj["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2)
        }
    
    # Add description
    if description:
        request_obj["request"]["description"] = description
    
    # Add tests
    if tests:
        test_script = create_test_script(tests)
        request_obj["event"] = [{
            "listen": "test",
            "script": {
                "exec": test_script.split("\n"),
                "type": "text/javascript"
            }
        }]
    
    return request_obj

def create_folder(name: str, items: List[Dict], description: str = "") -> Dict[str, Any]:
    """Create a Postman folder"""
    folder = {
        "name": name,
        "item": items
    }
    if description:
        folder["description"] = description
    return folder

# Common test scripts
COMMON_TESTS = [
    "pm.test('Response time < 2s', () => {",
    "  pm.expect(pm.response.responseTime).to.be.below(2000);",
    "});",
    "",
    "pm.test('Response is JSON', () => {",
    "  pm.response.to.be.json;",
    "});"
]

SUCCESS_TEST = [
    "pm.test('Status is 200', () => {",
    "  pm.response.to.have.status(200);",
    "});"
] + COMMON_TESTS

CREATED_TEST = [
    "pm.test('Status is 201', () => {",
    "  pm.response.to.have.status(201);",
    "});"
] + COMMON_TESTS

DELETED_TEST = [
    "pm.test('Status is 204 or 403', () => {",
    "  pm.expect([204, 403]).to.include(pm.response.code);",
    "});"
]

# Generate collection structure
collection = {
    "info": {
        "name": "ZthOrbit Comprehensive API Tests",
        "description": "Complete test coverage for all API endpoints in ZthOrbit backend",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        "_postman_id": generate_uuid(),
        "version": "1.0.0"
    },
    "auth": {
        "type": "bearer",
        "bearer": [
            {
                "key": "token",
                "value": "{{accessToken}}",
                "type": "string"
            }
        ]
    },
    "variable": [
        {"key": "baseUrl", "value": "http://13.205.72.30/api/v1", "type": "string"},
        {"key": "accessToken", "value": "", "type": "string"},
        {"key": "refreshToken", "value": "", "type": "string"},
        {"key": "superadminEmail", "value": "janakar.ganesan@gmail.com", "type": "string"},
        {"key": "superadminPassword", "value": "ChangeMe123!", "type": "string"},
        {"key": "lastVideoId", "value": "", "type": "string"},
        {"key": "lastPodcastId", "value": "", "type": "string"},
        {"key": "lastArticleId", "value": "", "type": "string"},
        {"key": "lastCaseStoryId", "value": "", "type": "string"},
        {"key": "lastAboutId", "value": "", "type": "string"},
        {"key": "lastTagId", "value": "", "type": "string"},
        {"key": "lastMediaId", "value": "", "type": "string"},
        {"key": "lastPostId", "value": "", "type": "string"},
        {"key": "lastUserId", "value": "", "type": "string"},
        {"key": "lastCommentId", "value": "", "type": "string"},
        {"key": "newUserEmail", "value": "", "type": "string"},
        {"key": "verificationCode", "value": "", "type": "string"}
    ],
    "event": [
        {
            "listen": "prerequest",
            "script": {
                "type": "text/javascript",
                "exec": [
                    "// Global pre-request script",
                    "console.log(`Executing: ${pm.info.requestName}`);"
                ]
            }
        },
        {
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": [
                    "// Global test script",
                    "if (pm.response.code >= 500) {",
                    "  console.error('Server error:', pm.response.text());",
                    "}"
                ]
            }
        }
    ],
    "item": []
}

# ========== 0. SETUP FOLDER ==========
setup_items = [
    create_request(
        name="Login as Superadmin",
        method="POST",
        url=f"{BASE_URL}/auth/login",
        body={
            "email": "{{superadminEmail}}",
            "password": "{{superadminPassword}}"
        },
        auth_required=False,
        description="Login to get access and refresh tokens",
        tests=[
            "pm.test('Login successful', () => {",
            "  pm.response.to.have.status(200);",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('accessToken');",
            "  pm.expect(json).to.have.property('refreshToken');",
            "  pm.environment.set('accessToken', json.accessToken);",
            "  pm.environment.set('refreshToken', json.refreshToken);",
            "  console.log('✓ Tokens stored');",
            "});",
            "",
            "pm.test('User is superadmin', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json.user.role).to.equal('superadmin');",
            "});"
        ] + COMMON_TESTS
    )
]

# ========== 1. AUTH FOLDER ==========
auth_items = [
    create_request(
        name="Register New User",
        method="POST",
        url=f"{BASE_URL}/auth/register",
        body={
            "email": "test-{{$timestamp}}@example.com",
            "password": "Test123!",
            "name": "Test User"
        },
        auth_required=False,
        description="Register a new user account",
        tests=[
            "pm.test('Registration accepted - 202', () => {",
            "  pm.response.to.have.status(202);",
            "});",
            "",
            "pm.test('Message indicates email verification needed', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json.message).to.include('verification');",
            "});"
        ]
    ),
    create_request(
        name="Resend Verification",
        method="POST",
        url=f"{BASE_URL}/auth/resend-verification",
        body={"email": "{{newUserEmail}}"},
        auth_required=False,
        description="Resend verification code",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Verify Email",
        method="POST",
        url=f"{BASE_URL}/auth/verify-email",
        body={
            "email": "{{newUserEmail}}",
            "code": "{{verificationCode}}"
        },
        auth_required=False,
        description="Verify email with 6-digit code",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Login",
        method="POST",
        url=f"{BASE_URL}/auth/login",
        body={
            "email": "{{superadminEmail}}",
            "password": "{{superadminPassword}}"
        },
        auth_required=False,
        description="Login with credentials",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Request Password Reset",
        method="POST",
        url=f"{BASE_URL}/auth/request-reset",
        body={"email": "{{superadminEmail}}"},
        auth_required=False,
        description="Request password reset email",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Refresh Token",
        method="POST",
        url=f"{BASE_URL}/auth/refresh",
        body={"refreshToken": "{{refreshToken}}"},
        auth_required=False,
        description="Refresh access token",
        tests=[
            "pm.test('New token received', () => {",
            "  pm.response.to.have.status(200);",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('accessToken');",
            "  pm.environment.set('accessToken', json.accessToken);",
            "});"
        ] + COMMON_TESTS
    ),
    create_request(
        name="Logout",
        method="POST",
        url=f"{BASE_URL}/auth/logout",
        body={"refreshToken": "{{refreshToken}}"},
        auth_required=False,
        description="Logout and revoke refresh token",
        tests=SUCCESS_TEST
    )
]

# ========== 2. LIVE STREAMING FOLDER ==========
live_items = [
    create_request(
        name="Get Live Config (Public)",
        method="GET",
        url=f"{BASE_URL}/live/config",
        auth_required=False,
        description="Get live stream configuration",
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Has stream URL', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('streamUrl');",
            "});"
        ]
    ),
    create_request(
        name="Update Live Config",
        method="PUT",
        url=f"{BASE_URL}/live/config",
        body={
            "streamUrl": "https://test-stream.example.com/live.m3u8",
            "title": "Test Live Stream",
            "isActive": True,
            "schedule": "Daily at 6 PM IST"
        },
        description="Update live config (Admin+)",
        tests=SUCCESS_TEST
    )
]

# ========== 3. VIDEOS FOLDER ==========
videos_items = [
    create_request(
        name="List Videos (Public)",
        method="GET",
        url=f"{BASE_URL}/videos?limit=10&skip=0",
        auth_required=False,
        description="List published videos with pagination",
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Response has pagination', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('videos');",
            "  pm.expect(json).to.have.property('total');",
            "  pm.expect(json.videos).to.be.an('array');",
            "});"
        ]
    ),
    create_request(
        name="Create Video",
        method="POST",
        url=f"{BASE_URL}/videos",
        body={
            "title": "Test Video {{$timestamp}}",
            "description": "Automated test video creation",
            "streamUrl": "https://example.com/test-{{$timestamp}}.m3u8",
            "thumbnailUrl": "https://example.com/thumb-{{$timestamp}}.jpg",
            "status": "published",
            "isLive": False,
            "tags": []
        },
        description="Create new video (Editor+)",
        tests=CREATED_TEST + [
            "",
            "pm.test('Video ID captured', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('_id');",
            "  pm.environment.set('lastVideoId', json._id);",
            "  console.log('Video ID:', json._id);",
            "});"
        ]
    ),
    create_request(
        name="Get Video by ID",
        method="GET",
        url=f"{BASE_URL}/videos/{{{{lastVideoId}}}}",
        auth_required=False,
        description="Get single video details",
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Video matches created', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json._id).to.equal(pm.environment.get('lastVideoId'));",
            "});"
        ]
    ),
    create_request(
        name="Update Video",
        method="PUT",
        url=f"{BASE_URL}/videos/{{{{lastVideoId}}}}",
        body={
            "title": "Updated Test Video",
            "description": "Updated by automated test"
        },
        description="Update video (Editor+)",
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Video updated', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json.title).to.equal('Updated Test Video');",
            "});"
        ]
    ),
    create_request(
        name="Delete Video (Superadmin Only)",
        method="DELETE",
        url=f"{BASE_URL}/videos/{{{{lastVideoId}}}}",
        description="Delete video - only superadmin can delete",
        tests=DELETED_TEST
    )
]

# ========== 4. PODCASTS FOLDER ==========
podcasts_items = [
    create_request(
        name="List Podcasts",
        method="GET",
        url=f"{BASE_URL}/podcasts",
        auth_required=False,
        description="List all podcasts",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create Podcast",
        method="POST",
        url=f"{BASE_URL}/podcasts",
        body={
            "title": "Test Podcast {{$timestamp}}",
            "description": "Automated test podcast",
            "audioUrl": "https://example.com/podcast-{{$timestamp}}.mp3",
            "thumbnailUrl": "https://example.com/podcast-thumb.jpg",
            "status": "published",
            "tags": []
        },
        description="Create new podcast (Editor+)",
        tests=CREATED_TEST + [
            "",
            "pm.test('Podcast ID captured', () => {",
            "  const json = pm.response.json();",
            "  pm.environment.set('lastPodcastId', json._id);",
            "});"
        ]
    ),
    create_request(
        name="Update Podcast",
        method="PUT",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}",
        body={"title": "Updated Test Podcast"},
        description="Update podcast (Editor+)",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Add Comment to Podcast",
        method="POST",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}/comments",
        body={
            "name": "Test Commenter",
            "email": "commenter@example.com",
            "content": "Great podcast!"
        },
        auth_required=False,
        description="Add comment (Public)",
        tests=CREATED_TEST + [
            "",
            "pm.test('Comment ID captured', () => {",
            "  const json = pm.response.json();",
            "  pm.environment.set('lastCommentId', json._id);",
            "});"
        ]
    ),
    create_request(
        name="Get Approved Comments",
        method="GET",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}/comments",
        auth_required=False,
        description="Get approved comments (Public)",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Get All Comments (Editor+)",
        method="GET",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}/comments/all",
        description="Get all comments including pending",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Moderate Comment",
        method="PATCH",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}/comments/{{{{lastCommentId}}}}/status",
        body={"status": "approved"},
        description="Approve/reject comment (Editor+)",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete Comment",
        method="DELETE",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}/comments/{{{{lastCommentId}}}}",
        description="Delete comment (Admin+)",
        tests=DELETED_TEST
    ),
    create_request(
        name="Delete Podcast",
        method="DELETE",
        url=f"{BASE_URL}/podcasts/{{{{lastPodcastId}}}}",
        description="Delete podcast (Admin+)",
        tests=DELETED_TEST
    )
]

# ========== 5. ARTICLES FOLDER ==========
articles_items = [
    create_request(
        name="List Articles",
        method="GET",
        url=f"{BASE_URL}/articles",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create Article",
        method="POST",
        url=f"{BASE_URL}/articles",
        body={
            "title": "Test Article {{$timestamp}}",
            "content": "Test content",
            "excerpt": "Test excerpt",
            "featured": False,
            "tags": []
        },
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastArticleId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Get Article by ID",
        method="GET",
        url=f"{BASE_URL}/articles/{{{{lastArticleId}}}}",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Update Article",
        method="PUT",
        url=f"{BASE_URL}/articles/{{{{lastArticleId}}}}",
        body={"title": "Updated Article"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Change Article Status",
        method="PATCH",
        url=f"{BASE_URL}/articles/{{{{lastArticleId}}}}/status",
        body={"status": "published"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete Article",
        method="DELETE",
        url=f"{BASE_URL}/articles/{{{{lastArticleId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 6. CASE STORIES FOLDER ==========
case_stories_items = [
    create_request(
        name="List Case Stories",
        method="GET",
        url=f"{BASE_URL}/case-stories",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create Case Story",
        method="POST",
        url=f"{BASE_URL}/case-stories",
        body={
            "title": "Test Case {{$timestamp}}",
            "description": "Test case story",
            "problem": "Problem description",
            "solution": "Solution description",
            "results": "Results achieved",
            "imageUrl": "https://example.com/case.jpg",
            "tags": []
        },
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastCaseStoryId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Get Case Story by ID",
        method="GET",
        url=f"{BASE_URL}/case-stories/{{{{lastCaseStoryId}}}}",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Update Case Story",
        method="PUT",
        url=f"{BASE_URL}/case-stories/{{{{lastCaseStoryId}}}}",
        body={"title": "Updated Case Story"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete Case Story",
        method="DELETE",
        url=f"{BASE_URL}/case-stories/{{{{lastCaseStoryId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 7. ABOUT FOLDER ==========
about_items = [
    create_request(
        name="Get About Blocks",
        method="GET",
        url=f"{BASE_URL}/about",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create About Block",
        method="POST",
        url=f"{BASE_URL}/about",
        body={
            "title": "Test Block {{$timestamp}}",
            "content": "Test about content",
            "order": 99
        },
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastAboutId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Update About Block",
        method="PUT",
        url=f"{BASE_URL}/about/{{{{lastAboutId}}}}",
        body={"title": "Updated About Block"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete About Block",
        method="DELETE",
        url=f"{BASE_URL}/about/{{{{lastAboutId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 8. TAGS FOLDER ==========
tags_items = [
    create_request(
        name="List Tags",
        method="GET",
        url=f"{BASE_URL}/tags",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create Tag",
        method="POST",
        url=f"{BASE_URL}/tags",
        body={"name": "test-tag-{{$timestamp}}", "slug": "test-tag-{{$timestamp}}"},
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastTagId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Delete Tag",
        method="DELETE",
        url=f"{BASE_URL}/tags/{{{{lastTagId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 9. MEDIA FOLDER ==========
media_items = [
    create_request(
        name="List Media",
        method="GET",
        url=f"{BASE_URL}/media?limit=10",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create Media",
        method="POST",
        url=f"{BASE_URL}/media",
        body={
            "title": "Test Media {{$timestamp}}",
            "kind": "video",
            "content": "Media content",
            "mediaUrl": "https://example.com/media.mp4",
            "status": "published"
        },
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastMediaId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Get Media by ID",
        method="GET",
        url=f"{BASE_URL}/media/{{{{lastMediaId}}}}",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Update Media",
        method="PUT",
        url=f"{BASE_URL}/media/{{{{lastMediaId}}}}",
        body={"title": "Updated Media"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Change Media Status",
        method="PATCH",
        url=f"{BASE_URL}/media/{{{{lastMediaId}}}}/status",
        body={"status": "published"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete Media",
        method="DELETE",
        url=f"{BASE_URL}/media/{{{{lastMediaId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 10. POSTS FOLDER ==========
posts_items = [
    create_request(
        name="List Posts",
        method="GET",
        url=f"{BASE_URL}/posts",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create Post",
        method="POST",
        url=f"{BASE_URL}/posts",
        body={
            "title": "Test Post {{$timestamp}}",
            "content": "Post content",
            "excerpt": "Post excerpt"
        },
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastPostId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Get Post by ID",
        method="GET",
        url=f"{BASE_URL}/posts/{{{{lastPostId}}}}",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Update Post",
        method="PUT",
        url=f"{BASE_URL}/posts/{{{{lastPostId}}}}",
        body={"title": "Updated Post"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete Post",
        method="DELETE",
        url=f"{BASE_URL}/posts/{{{{lastPostId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 11. NOTIFICATIONS FOLDER ==========
notifications_items = [
    create_request(
        name="Get My Notifications",
        method="GET",
        url=f"{BASE_URL}/notifications",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Mark All as Read",
        method="PATCH",
        url=f"{BASE_URL}/notifications/read-all",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete All Notifications",
        method="DELETE",
        url=f"{BASE_URL}/notifications",
        tests=DELETED_TEST
    )
]

# ========== 12. USERS FOLDER ==========
users_items = [
    create_request(
        name="List Users",
        method="GET",
        url=f"{BASE_URL}/users?limit=10",
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Create User",
        method="POST",
        url=f"{BASE_URL}/users",
        body={
            "email": "newuser-{{$timestamp}}@example.com",
            "password": "Pass123!",
            "name": "New User",
            "role": "viewer"
        },
        tests=CREATED_TEST + [
            "",
            "pm.environment.set('lastUserId', pm.response.json()._id);"
        ]
    ),
    create_request(
        name="Update User",
        method="PUT",
        url=f"{BASE_URL}/users/{{{{lastUserId}}}}",
        body={"name": "Updated User Name"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Change User Status",
        method="PATCH",
        url=f"{BASE_URL}/users/{{{{lastUserId}}}}/status",
        body={"status": "active"},
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Delete User",
        method="DELETE",
        url=f"{BASE_URL}/users/{{{{lastUserId}}}}",
        tests=DELETED_TEST
    )
]

# ========== 13. ADMIN FOLDER ==========
admin_items = [
    create_request(
        name="Get Dashboard Summary",
        method="GET",
        url=f"{BASE_URL}/admin/summary",
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Has stats', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('totalUsers');",
            "  pm.expect(json).to.have.property('totalVideos');",
            "});"
        ]
    ),
    create_request(
        name="Test Email Configuration",
        method="POST",
        url=f"{BASE_URL}/admin/test-email",
        body={"recipientEmail": "test@example.com"},
        tests=SUCCESS_TEST
    )
]

# ========== 14. REFERENCE FOLDER ==========
reference_items = [
    create_request(
        name="Get Categories",
        method="GET",
        url=f"{BASE_URL}/api/categories",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Get Menus",
        method="GET",
        url=f"{BASE_URL}/api/menus",
        auth_required=False,
        tests=SUCCESS_TEST
    ),
    create_request(
        name="Get All Tags",
        method="GET",
        url=f"{BASE_URL}/api/tags",
        auth_required=False,
        tests=SUCCESS_TEST
    )
]

# ========== 15. SEARCH FOLDER ==========
search_items = [
    create_request(
        name="Global Search",
        method="GET",
        url=f"{BASE_URL}/search?q=sustainability",
        auth_required=False,
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Has search results', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('results');",
            "  pm.expect(json.results).to.be.an('array');",
            "});"
        ]
    )
]

# ========== 16. UPLOADS FOLDER ==========
uploads_items = [
    create_request(
        name="Get Presigned Upload URL",
        method="POST",
        url=f"{BASE_URL}/uploads/presign",
        body={
            "fileName": "test-upload-{{$timestamp}}.jpg",
            "fileType": "image/jpeg"
        },
        tests=SUCCESS_TEST + [
            "",
            "pm.test('Has upload URL', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json).to.have.property('uploadUrl');",
            "  pm.expect(json).to.have.property('fileUrl');",
            "});"
        ]
    )
]

# Build collection
collection["item"] = [
    create_folder("0-Setup", setup_items, "Run this first to authenticate"),
    create_folder("1-Auth", auth_items, "Authentication endpoints"),
    create_folder("2-Live", live_items, "Live streaming configuration"),
    create_folder("3-Videos", videos_items, "Video CRUD operations"),
    create_folder("4-Podcasts", podcasts_items, "Podcast management with comments"),
    create_folder("5-Articles", articles_items, "Article CRUD operations"),
    create_folder("6-Case Stories", case_stories_items, "Case story management"),
    create_folder("7-About", about_items, "About page blocks"),
    create_folder("8-Tags", tags_items, "Tag management"),
    create_folder("9-Media", media_items, "Unified media content"),
    create_folder("10-Posts", posts_items, "Blog posts"),
    create_folder("11-Notifications", notifications_items, "User notifications"),
    create_folder("12-Users", users_items, "User management"),
    create_folder("13-Admin", admin_items, "Admin dashboard"),
    create_folder("14-Reference", reference_items, "Reference data endpoints"),
    create_folder("15-Search", search_items, "Global search"),
    create_folder("16-Uploads", uploads_items, "File upload presigning")
]

# Write collection to file
output_path = "comprehensive-api-tests.postman_collection.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2)

print(f"✅ Generated Postman collection: {output_path}")
print(f"📊 Total folders: {len(collection['item'])}")
total_requests = sum(len(folder['item']) for folder in collection['item'])
print(f"🧪 Total requests: {total_requests}")
print("\nNext steps:")
print("1. Import into Postman")
print("2. Import environment file")
print("3. Run '0-Setup / Login as Superadmin' to authenticate")
print("4. Run entire collection with Collection Runner")
