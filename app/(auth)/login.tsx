import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { SignInForm } from "@/components/sign-in-form"

export default function Login() {
  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="items-center justify-center p-4 py-8 sm:py-4 sm:p-6"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-sm">
            <SignInForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
