//
//  MobileWebView.swift
//  ProMove Fleet
//
//  High-performance WKWebView container rendering the full responsive ProMove mobile web platform
//  with persistent Clerk auth, live GPS radar, pull-to-refresh, and offline resilience.
//

import SwiftUI
import WebKit

public struct MobileWebView: View {
    public let initialUrlString: String
    
    @State private var isLoading: Bool = true
    @State private var progress: Double = 0.0
    @State private var hasError: Bool = false
    @State private var errorMessage: String = ""
    @State private var webViewCoordinator: WebViewCoordinator?
    
    public init(initialUrlString: String = Constants.defaultApiBaseUrl) {
        self.initialUrlString = initialUrlString
    }
    
    public var body: some View {
        ZStack(alignment: .top) {
            // Main Web Surface
            WKWebViewRepresentable(
                urlString: initialUrlString,
                isLoading: $isLoading,
                progress: $progress,
                hasError: $hasError,
                errorMessage: $errorMessage,
                onCoordinatorCreated: { coordinator in
                    self.webViewCoordinator = coordinator
                }
            )
            .ignoresSafeArea(edges: .bottom)
            
            // Subtle Loading Progress Bar
            if isLoading && progress < 1.0 {
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.clear)
                            .frame(height: 3)
                        
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [ProMoveColors.deepSea, ProMoveColors.vibrantTeal],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: max(0, geometry.size.width * CGFloat(progress)), height: 3)
                            .animation(.easeOut(duration: 0.2), value: progress)
                    }
                }
                .frame(height: 3)
                .ignoresSafeArea(edges: .top)
            }
            
            // Offline / Connection Error Overlay
            if hasError {
                VStack(spacing: 20) {
                    Spacer()
                    
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 54, weight: .semibold))
                        .foregroundColor(ProMoveColors.deepSea)
                    
                    VStack(spacing: 8) {
                        Text("Unable to Connect to ProMove")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(ProMoveColors.slate900)
                        
                        Text("Please make sure your local development server is running at \(initialUrlString) or check your cellular/Wi-Fi connection.")
                            .font(.system(size: 14))
                            .foregroundColor(ProMoveColors.slate500)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    
                    Button(action: {
                        hasError = false
                        webViewCoordinator?.reload()
                    }) {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 15, weight: .bold))
                            Text("Retry Connection")
                                .font(.system(size: 16, weight: .bold))
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 14)
                        .background(ProMoveColors.deepSea)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .shadow(color: ProMoveColors.deepSea.opacity(0.3), radius: 8, x: 0, y: 4)
                    }
                    
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.white)
                .transition(.opacity)
            }
        }
    }
}

// MARK: - UIViewRepresentable Wrapping WKWebView

struct WKWebViewRepresentable: UIViewRepresentable {
    let urlString: String
    @Binding var isLoading: Bool
    @Binding var progress: Double
    @Binding var hasError: Bool
    @Binding var errorMessage: String
    var onCoordinatorCreated: (WebViewCoordinator) -> Void
    
    func makeCoordinator() -> WebViewCoordinator {
        let coordinator = WebViewCoordinator(self)
        DispatchQueue.main.async {
            onCoordinatorCreated(coordinator)
        }
        return coordinator
    }
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.websiteDataStore = WKWebsiteDataStore.default()
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = true
        
        // Append custom user agent
        let defaultUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
        webView.customUserAgent = "\(defaultUA) ProMoveNativeApp/1.0 (iOS)"
        
        // Add Pull-to-refresh
        let refreshControl = UIRefreshControl()
        refreshControl.tintColor = UIColor(red: 0.13, green: 0.44, blue: 0.51, alpha: 1.0)
        refreshControl.addTarget(context.coordinator, action: #selector(WebViewCoordinator.handleRefreshControl(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
        
        context.coordinator.setupObservers(for: webView)
        context.coordinator.targetWebView = webView
        
        if let url = URL(string: urlString) {
            let request = URLRequest(url: url, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
            webView.load(request)
        }
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Updates handled via coordinator observers
    }
}

// MARK: - WebViewCoordinator

final class WebViewCoordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
    private var parent: WKWebViewRepresentable
    weak var targetWebView: WKWebView?
    private var progressObservation: NSKeyValueObservation?
    private var loadingObservation: NSKeyValueObservation?
    
    init(_ parent: WKWebViewRepresentable) {
        self.parent = parent
        super.init()
    }
    
    deinit {
        progressObservation?.invalidate()
        loadingObservation?.invalidate()
    }
    
    func setupObservers(for webView: WKWebView) {
        progressObservation = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] webView, _ in
            DispatchQueue.main.async {
                self?.parent.progress = webView.estimatedProgress
            }
        }
        
        loadingObservation = webView.observe(\.isLoading, options: [.new]) { [weak self] webView, _ in
            DispatchQueue.main.async {
                self?.parent.isLoading = webView.isLoading
            }
        }
    }
    
    @objc func handleRefreshControl(_ refreshControl: UIRefreshControl) {
        targetWebView?.reload()
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            refreshControl.endRefreshing()
        }
    }
    
    func reload() {
        targetWebView?.reload()
    }
    
    // MARK: - WKNavigationDelegate
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        parent.hasError = false
        parent.isLoading = true
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        parent.isLoading = false
        parent.hasError = false
        webView.scrollView.refreshControl?.endRefreshing()
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        parent.isLoading = false
        parent.hasError = true
        parent.errorMessage = error.localizedDescription
        webView.scrollView.refreshControl?.endRefreshing()
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        parent.isLoading = false
        parent.hasError = true
        parent.errorMessage = error.localizedDescription
        webView.scrollView.refreshControl?.endRefreshing()
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url {
            let scheme = url.scheme?.lowercased() ?? ""
            if scheme == "tel" || scheme == "mailto" || scheme == "sms" {
                if UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url)
                    decisionHandler(.cancel)
                    return
                }
            }
        }
        decisionHandler(.allow)
    }
    
    // MARK: - WKUIDelegate (Prompt, Alert, and Media Permissions)
    
    @available(iOS 15.0, *)
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }
    
    @available(iOS 15.0, *)
    func webView(_ webView: WKWebView, requestDeviceOrientationAndMotionPermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        // Handle target="_blank" links inside the same webView
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }
}
