import Line from "@xmartlabs/react-native-line"
import { useColorScheme } from "nativewind"
import { Image, Platform, View } from "react-native"
import { Button } from "@/components/ui/button"
import { lineAuth } from "@/lib/lineAuth"
import { cn } from "@/lib/utils"

const SOCIAL_CONNECTION_STRATEGIES = [
  {
    type: "oauth_apple",
    source: { uri: "https://img.clerk.com/static/apple.png?width=160" },
    useTint: true,
  },
  {
    type: "oauth_google",
    source: { uri: "https://img.clerk.com/static/google.png?width=160" },
    useTint: false,
  },
  {
    type: "oauth_github",
    source: { uri: "https://img.clerk.com/static/github.png?width=160" },
    useTint: true,
  },
  {
    type: "oidc_line",
    source: { uri: "https://img.clerk.com/static/line.png?width=160" },
    useTint: true,
  },
]

Line.setup({
  channelId: "2007977071",
})

export function SocialConnections() {
  const { colorScheme } = useColorScheme()

  return (
    <View className="gap-2 sm:flex-row sm:gap-3">
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
        return (
          <Button
            key={strategy.type}
            variant="outline"
            size="sm"
            className="sm:flex-1"
            onPress={async () => {
              if (strategy.type === "oauth_apple") {
                // TODO: Authenticate with Apple
              } else if (strategy.type === "oauth_google") {
                // TODO: Authenticate with Google
              } else if (strategy.type === "oauth_github") {
                // TODO: Authenticate with GitHub
              } else if (strategy.type === "oidc_line") {
                await lineAuth()
              }
            }}
          >
            <Image
              className={cn(
                "size-4",
                strategy.useTint && Platform.select({ web: "dark:invert" })
              )}
              tintColor={Platform.select({
                native: strategy.useTint
                  ? colorScheme === "dark"
                    ? "white"
                    : "black"
                  : undefined,
              })}
              source={strategy.source}
            />
          </Button>
        )
      })}
    </View>
  )
}
